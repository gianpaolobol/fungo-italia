export function subscriptionStore(platform:string){
 if(platform==='android')return{
  name:'Google Play',account:'Google Play',
  manage:'https://play.google.com/store/account/subscriptions?sku=it.fungoitalia.premium.annual&package=it.fungoitalia.app',
  terms:'https://play.google.com/intl/it_it/about/play-terms/index.html',
  payment:'Il pagamento viene gestito dal tuo account Google Play alla conferma. L’abbonamento si rinnova automaticamente al prezzo mostrato da Google, salvo annullamento prima del rinnovo. Puoi gestire o annullare il rinnovo negli abbonamenti Google Play. La disdetta conserva l’accesso fino alla scadenza del periodo pagato, salvo rimborso o revoca.',
 };
 return{name:'App Store',account:'Apple',manage:'https://apps.apple.com/account/subscriptions',terms:'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',payment:'Il pagamento viene addebitato al tuo account Apple alla conferma dell’acquisto. L’abbonamento si rinnova automaticamente, salvo disdetta almeno 24 ore prima della scadenza. Il costo del rinnovo viene addebitato nelle 24 ore precedenti la scadenza. Puoi gestire o annullare il rinnovo nelle impostazioni degli abbonamenti Apple.'};
}
