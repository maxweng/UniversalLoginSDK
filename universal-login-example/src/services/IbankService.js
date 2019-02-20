
import {fetch} from '../utils/http';

function getQueryString(name)
{
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}

const appKey = '200728419515141';

const HOST = "http://101.200.36.28:6111";

class IbankService {
  constructor(storageService) {
    this.storageService = storageService;
  }

  async getAccessToken(accessCode) {
    const url = HOST+'/lbank/user/access_token';
    const method = 'POST';
    let body  = new FormData();
    body.append('app_key', appKey);
    body.append('access_code', accessCode);
    const response = await fetch(url, {credentials: 'include',method, body});
    const responseJson = await response.json();
    if (response.status === 200) {
      return responseJson.data
    }else{
      new Error(`${response.status}`);
    }
  }

  async getUserInfo(accessToken) {
    const url = HOST+'/lbank/user/info';
    const method = 'POST';
    let body  = new FormData();
    body.append('app_key', appKey);
    body.append('access_token', accessToken);
    // body.append('open_id', openId);
    const response = await fetch(url, {credentials: 'include',method, body});
    const responseJson = await response.json();
    if (response.status === 200) {
      return responseJson.data
    }else{
      new Error(`${response.status}`);
    } 
  }

  async getBalance(accessToken) {
    const url = HOST+'/lbank/user/balance';
    const method = 'POST';
    let body  = new FormData();
    body.append('app_key', appKey);
    body.append('access_token', accessToken.access_token);
    const response = await fetch(url, {credentials: 'include',method, body});
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
          let userInfo = await this.getUserInfo(accessToken.access_token,accessToken.open_id);
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
