
import {fetch} from '../utils/http';

function getQueryString(name)
{
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}

const HOST = "http://101.200.36.28:6101";

class IbankService {
  constructor(storageService) {
    this.storageService = storageService;
    this.appKey = '200728419515141';
  }

  async getAccessToken(accessCode) {
    const url = HOST+'/lbank/user/access_token';
    const method = 'POST';
    let body  = new FormData();
    body.append('app_key', this.appKey);
    body.append('access_code', accessCode);
    const response = await fetch(url, {method, body});
    const responseJson = await response.json();
    if (response.status === 200) {
      this.openId = responseJson.data.open_id;
      this.refreshToken = responseJson.data.refresh_token;
      this.accessToken = responseJson.data.access_token;
      return responseJson.data
    }else{
      new Error(`${response.status}`);
    }
  }

  async trade(signatureData) {
    let accessCode = getQueryString('access_code');
    let accessToken = await this.getAccessToken(accessCode);
    const url = HOST+'/lbank/trade';
    const method = 'POST';
    let body  = new FormData();
    body.append('app_key', '200728419515141');
    body.append('access_token', this.accessToken);
    body.append('open_id', '100020');
    body.append('order_no', parseInt(Math.random()*1000000));
    body.append('trade_type', '0');
    body.append('asset_code', 'usdt');
    body.append('amount', '1');
    body.append('signatureData', signatureData);

    const response = await fetch(url, {method, body});
    const responseJson = await response.json();
    if (response.status === 200) {
      console.log(responseJson)
      return responseJson.data
    }else{
      new Error(`${response.status}`);
    } 
  }

  async getUserInfo() {
    const url = HOST+'/lbank/user/info';
    const method = 'POST';
    let body  = new FormData();
    body.append('app_key', this.appKey);
    body.append('access_token', this.accessToken);
    body.append('open_id', this.openId);
    const response = await fetch(url, {method, body});
    const responseJson = await response.json();
    if (response.status === 200) {
      return responseJson.data
    }else{
      new Error(`${response.status}`);
    } 
  }

  async isValid() {
    const url = HOST+'/lbank/user/valid_token';
    const method = 'POST';
    let body  = new FormData();
    body.append('app_key', this.appKey);
    body.append('access_token', this.accessToken);
    body.append('open_id', this.openId);
    const response = await fetch(url, {method, body});
    const responseJson = await response.json();
    if (response.status === 200) {
      return responseJson.data
    }else{
      new Error(`${response.status}`);
    } 
  }

  async onRefreshToken() {
    const url = HOST+'/lbank/user/refresh_token';
    const method = 'POST';
    let body  = new FormData();
    body.append('app_key', this.appKey);
    body.append('refresh_token', this.refreshToken);
    body.append('open_id', this.openId);
    const response = await fetch(url, {method, body});
    const responseJson = await response.json();
    if (response.status === 200) {
      return responseJson.data
    }else{
      new Error(`${response.status}`);
    } 
  }

  async getBalance() {
    const url = HOST+'/lbank/user/balance';
    const method = 'POST';
    let body  = new FormData();
    body.append('app_key', this.appKey);
    body.append('access_token', this.accessToken);
    body.append('open_id', this.openId);
    const response = await fetch(url, {method, body});
    const responseJson = await response.json();
    if (response.status === 200) {
      return responseJson.data
    }else{
      new Error(`${response.status}`);
    } 
  }

  async getUserName () {
    const identity = await this.storageService.getIdentity();
    if (identity) {
        return null
    } else{
        let accessCode = getQueryString('access_code');
        if(accessCode){
          let accessToken = await this.getAccessToken(accessCode);
          let userInfo = await this.getUserInfo();
          let userName = userInfo.open_id
          return userName
        }else{
          //window.location.href=HOST+"/lbank/user/access?app=test"
          return null
        }      
    }
  }
}

export default IbankService;
