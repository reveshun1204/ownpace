import {application} from '../config/application.js';
export class ApiError extends Error {
  constructor(message,kind='network',status=0){super(message);this.name='ApiError';this.kind=kind;this.status=status;}
}
const messages={
 'Registration required':'先に会員登録を完了してください。',
 'Forbidden':'この操作を行う権限がありません。',
 'Reservation closed':'この開催の受付は終了しました。',
 'Event not found':'開催情報が見つかりません。',
 'Birthday already registered':'誕生日は登録済みです。変更は管理者へご相談ください。',
 'Invalid birthday':'誕生日を確認してください。',
};
// Tokens stay inside the SDK. No localStorage, console logs or automatic write retries.
export function createLineSession({liffId,sdk=globalThis.liff,fetcher=globalThis.fetch,onAuthRequired=()=>{}}){
 let ready=false,valid=false;
 const inClient=()=>ready&&sdk.isInClient();
 function invalidate(){valid=false;if(ready&&!inClient())sdk.logout();onAuthRequired(inClient()?'client':'external');}
 return {
  get isInClient(){return inClient();},
  async start(){
   if(!liffId)throw new ApiError('MY PAGE用のLINE設定は準備中です。','config');
   if(!sdk?.init)throw new ApiError('LINEの読み込みに失敗しました。通信状態をご確認ください。','sdk');
   try{await sdk.init({liffId,withLoginOnExternalBrowser:false});ready=true;valid=sdk.isLoggedIn()&&!!sdk.getIDToken();}
   catch{throw new ApiError('LINE認証を開始できませんでした。もう一度開き直してください。','sdk');}
   if(!valid)onAuthRequired(inClient()?'client':'external');
   return valid;
  },
  login(){
   if(!ready)throw new ApiError('LINE認証の準備ができていません。','sdk');
   if(inClient()){onAuthRequired('client');return;}
   // Only an explicit button click calls login. Do not preserve old OAuth query parameters.
   const redirectUrl = new URL(location.origin + location.pathname);

if (
  liffId === application.reservationLiffId &&
  new URLSearchParams(location.search).get('view') === 'my-booking'
) {
  redirectUrl.searchParams.set('view', 'my-booking');
}

sdk.logout();
valid = false;
sdk.login({redirectUri: redirectUrl.toString()});
  },
  request(action,fields={}){return this.requestTo(application.api,action,fields);},
  async requestTo(endpoint,action,fields={}){
   if(!ready||!valid||!sdk.isLoggedIn()||!sdk.getIDToken())throw new ApiError('LINEでログインしてください。','auth',401);
   let response,data;
   try{response=await fetcher(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({...fields,action,idToken:sdk.getIDToken()}),cache:'no-store',signal:AbortSignal.timeout(25000)});
    data=await response.json();
   }catch{throw new ApiError('通信結果を確認できませんでした。通信状態を確認して再度お試しください。','network');}
   if(response.status===401){invalidate();throw new ApiError('LINE認証の期限が切れました。再ログインしてください。','auth',401);}
   if(!response.ok||data?.success!==true)throw new ApiError(messages[data?.error]||(response.status===403?'この操作を行う権限がありません。':'処理結果を確認できませんでした。最新の情報をご確認ください。'),'server',response.status);
   return data;
  },
 };
}
