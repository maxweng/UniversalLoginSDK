
import {fetch} from '../utils/http';
import { getQueryString } from '../utils/utils';

const HOST = "http://101.200.36.28:6101";

class IbankService {
  constructor(storageService) {
    this.storageService = storageService;
    this.appKey = '200728419515141';
    this.accessCode = getQueryString('access_code');
    this.getAccessToken();
  }

  async getAccessToken() {
    const url = HOST+'/lbank/user/access_token';
    const method = 'POST';
    let body  = new FormData();
    body.append('app_key', this.appKey);
    body.append('access_code', this.accessCode);
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

  //测试用的，正式需要去掉
  async trade(signatureData) {
    const url = HOST+'/lbank/trade';
    const method = 'POST';
    let body  = new FormData();
    body.append('app_key', '200728419515141');
    body.append('access_token', this.accessToken);
    body.append('open_id', '100020');
    body.append('order_no', parseInt(Math.random()*100000)+'');
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
    if(!await this.isValid()){
      await this.onRefreshToken();
    }
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
      return responseJson.valid
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
    if(!await this.isValid()){
      await this.onRefreshToken();
    }
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
        if(this.accessCode){
          let userInfo = await this.getUserInfo();
          let userName = userInfo.open_id
          return userName
        }
        
        return null
    }
  }
}

export default IbankService;
