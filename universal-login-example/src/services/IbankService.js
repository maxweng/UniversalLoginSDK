
import {fetch} from '../utils/http';

function getQueryString(name)
{
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}

const appKey = '2bmhkhced55m2q3b69lcgvxuvouc2x9sj59xljfwc81enxfqdf368bt3mdniihq9';

class IbankService {
  constructor(storageService) {
    this.storageService = storageService;
  }

  async getAccessToken(accessCode) {
    const url = 'http://101.200.36.28:5000/lbank/user/access_token';
    const method = 'POST';
    let body  = new FormData();
    body.append('app_key', appKey);
    body.append('access_code', accessCode);
    const response = await fetch(url, {method, body});
    const responseJson = await response.json();
    if (response.status === 200) {
      return responseJson.data.access_token
    }else{
      new Error(`${response.status}`);
    }
  }

  async getUserInfo(accessToken) {
    const url = 'http://101.200.36.28:5000/lbank/user/info';
    const method = 'POST';
    let body  = new FormData();
    body.append('app_key', appKey);
    body.append('access_token', accessToken);
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
        let accessToken = await this.getAccessToken(accessCode);
        let userInfo = await this.getUserInfo(accessToken);
        //暂时用open_id代替user_name
        let userName = userInfo.open_id
        return userName
    }
  }
}

export default IbankService;
