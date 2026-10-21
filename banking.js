'use strict';
const crypto=require('node:crypto');
const GROUPS=[["Savings",["Tabungan Reguler","Tabungan Payroll","Tabungan Anak","Tabungan Pelajar","Tabungan Bisnis","Tabungan Berjangka","Tabungan Valas","Tabungan Premium","Tabungan Digital"]],["Deposits",["Deposito Rupiah","Deposito USD","Deposito Valas","Deposito ARO","Deposito Non-ARO","Deposito Online","Deposito Bisnis","Deposito Negotiable","Deposito Berjangka"]],["Current Account",["Giro Perorangan","Giro Bisnis","Giro Valas","Giro Premium","Giro Corporate","Giro Escrow","Giro Payroll","Giro Multicurrency","Giro Syariah"]],["Consumer Lending",["KPR Fixed","KPR Floating","KPR Refinancing","KPR Take Over","KPA","KKB","Kredit Multiguna","KTA","Kredit Payroll"]],["SME Lending",["Kredit Modal Kerja","Kredit Investasi","Kredit Rekening Koran","Kredit Usaha Berjangka","Invoice Financing","Distributor Financing","Supply-Chain Financing"]],["Corporate Lending",["Revolving Loan","Term Loan","Syndicated Loan","Project Financing","Capex Financing","Acquisition Financing","Bridging Loan"]],["Trade Finance",["Letter of Credit","SKBDN","Bank Garansi","Standby L/C","Trust Receipt","Export Financing","Import Financing","Documentary Collection"]],["Cash Management",["Virtual Account","Collection","Payroll","Bulk Payment","Liquidity Management","Cash Pooling","Escrow","Host-to-Host","API Banking"]],["Treasury & FX",["Spot FX","FX Forward","FX Swap","Money Market","Hedging","Structured Treasury"]],["Wealth Management",["Reksa Dana","SBN","Obligasi","Bancassurance","Wealth Advisory","Investment Distribution"]],["Digital & Payment",["Mobile Banking","Internet Banking","QRIS","EDC","Payment Gateway","Debit Card","Corporate Card","Merchant Services"]],["Specialized Banking",["Priority Banking","Private Banking","Pension Services","Custodian","Trustee","Syariah Financing","Cross-Border Services"]]];
function mountBanking(app,db){
db.exec(`CREATE TABLE IF NOT EXISTS banking_products(code TEXT PRIMARY KEY,category TEXT NOT NULL,name TEXT NOT NULL,rate_pct REAL,kind TEXT NOT NULL DEFAULT 'SIMULATION',effective_on TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS banking_customers(id TEXT PRIMARY KEY,name TEXT NOT NULL,segment TEXT NOT NULL,industry TEXT NOT NULL,deposit_idr REAL NOT NULL,loan_idr REAL NOT NULL,is_synthetic INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS banking_proposals(id TEXT PRIMARY KEY,customer_id TEXT NOT NULL REFERENCES banking_customers(id),product_code TEXT NOT NULL REFERENCES banking_products(code),amount REAL NOT NULL,annual_rate REAL NOT NULL,months INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'DRAFT',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_banking_category ON banking_products(category);`);
const put=db.prepare('INSERT OR IGNORE INTO banking_products(code,category,name,rate_pct,effective_on) VALUES(?,?,?,?,?)');
const seed=db.transaction(()=>{
 GROUPS.forEach(([category,names],ci)=>names.forEach((name,i)=>{
  const code='MC-'+String(ci+1).padStart(2,'0')+'-'+String(i+1).padStart(3,'0');
  const rate=/(Lending|Loan|KPR|KKB|KTA|Kredit)/i.test(category+' '+name)?Number((7.5+((ci*13+i*7)%65)/10).toFixed(2)):/Deposit/i.test(category)?Number((2.25+i*.2).toFixed(2)):null;
  put.run(code,category,name,rate,'2026-10-21');
 }));
 const customer=db.prepare('INSERT OR IGNORE INTO banking_customers(id,name,segment,industry,deposit_idr,loan_idr) VALUES(?,?,?,?,?,?)');
 for(let i=1;i<=50;i++)customer.run('DUMMY-'+String(i).padStart(3,'0'),'Nasabah Simulasi '+String(i).padStart(3,'0'),['Retail','SME','Corporate'][i%3],['Perdagangan','Manufaktur','Jasa','Individu'][i%4],i*17500000,i%3*95000000);
});seed();
const deny=(res,s=403)=>res.status(s).json({detail:'Individual authenticated identity and RBAC required; shared app token is insufficient'});
const demoOnly=(req,res,next)=>{if(process.env.RM_ENABLE_BANKING_DEMO!=='true')return res.status(503).json({detail:'Banking demo disabled. Set RM_ENABLE_BANKING_DEMO=true in a non-production environment.'});next()};
const fail=(res,e)=>res.status(400).json({detail:e.message});
const amount=(n)=>{if(typeof n!=='number'||!Number.isFinite(n)||n<=0||n>1e15)throw Error('Invalid principal');return n};
const rate=(n)=>{if(typeof n!=='number'||!Number.isFinite(n)||n<0||n>100)throw Error('Invalid annual rate');return n};
const tenor=(n)=>{if(!Number.isInteger(n)||n<1||n>360)throw Error('Invalid months');return n};
app.get('/api/banking/products',(req,res)=>{const q=String(req.query.q||'').slice(0,80),cat=String(req.query.category||'').slice(0,80);res.json({synthetic:true,products:db.prepare('SELECT * FROM banking_products WHERE name LIKE ? AND category LIKE ? ORDER BY category,code LIMIT 150').all('%'+q+'%','%'+cat+'%')})});
app.get('/api/banking/catalog-summary',(req,res)=>res.json({synthetic:true,products:db.prepare('SELECT count(*) AS n FROM banking_products').get().n,categories:db.prepare('SELECT count(distinct category) AS n FROM banking_products').get().n}));
app.post('/api/banking/simulate/deposit',(req,res)=>{try{const b=req.body||{},p=amount(b.principal),r=rate(b.annual_rate_pct),m=tenor(b.tenor_months),gross=p*r/1200*m;res.json({synthetic:true,principal:p,interest_gross:Math.round(gross),illustrative_net_after_20pct_tax:Math.round(gross*.8),notes:'Illustrative simple interest months/12. Check actual tax, LPS and product terms.'})}catch(e){fail(res,e)}});
app.post('/api/banking/simulate/loan',(req,res)=>{try{const b=req.body||{},p=amount(b.principal),r=rate(b.annual_rate_pct)/1200,m=tenor(b.tenor_months);const payment=r?p*r/(1-Math.pow(1+r,-m)):p/m;res.json({synthetic:true,monthly_installment:Math.round(payment),total_interest:Math.round(payment*m-p),notes:'Fixed effective-rate annuity only. No fees, floating adjustment or underwriting.'})}catch(e){fail(res,e)}});
app.get('/api/banking/customers',demoOnly,(req,res)=>res.json({synthetic:true,customers:db.prepare('SELECT * FROM banking_customers WHERE is_synthetic=1 LIMIT 100').all()}));
app.get('/api/banking/proposals',(req,res)=>deny(res,403));
app.post('/api/banking/proposals',(req,res)=>deny(res,403));
app.post('/api/banking/approvals/:id/decision',(req,res)=>deny(res,403));
}
module.exports={mountBanking};
