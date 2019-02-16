import React, {Component} from 'react';
import HeaderView from '../views/HeaderView';
import BackToAppBtn from './BackToAppBtn';
import PropTypes from 'prop-types';

function getQueryString(name)
{
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}

class CoinCenter extends Component {
  constructor(props) {
    super(props);
    this.emitter = this.props.identityService.emitter;
    this.identityService = this.props.identityService;
    this.IbankService = this.props.IbankService;
    this.state = {
      userName: '',
      userBalance: 0,
      fxPoints: 0,
      timeLeft: 0,
      dividends: 0,
      coins: 0,
      airDropPot: 0,
    };
  }

  async componentDidMount() {
    let gamePool = await this.identityService.getFXPInfo()
    let playerInfo = await this.identityService.getPlayerInfo()
    let accessCode = getQueryString('access_code');
    let accessToken = await this.IbankService.getAccessToken(accessCode);
    let userInfo = await this.IbankService.getUserInfo(accessToken);
    let userBalance = await this.IbankService.getBalance(accessToken);
    let that = this
    setInterval(function(){
      console.log(1)
      that.setState({
        timeLeft: that.state.timeLeft - 1
      })
    }, 1000)
    this.setState({
      userName: userInfo.user_name,
      userBalance: userBalance.balance.eth,
      fxPoints: playerInfo.balance,
      timeLeft: gamePool.timeLeft,
      dividends: playerInfo.aff+playerInfo.gen+playerInfo.win,
      coins: 0,
      airDropPot: gamePool.airDropPot,
    })
  }

  sec_to_time(s) {
    var t;
    if(s > -1){
        var hour = Math.floor(s/3600);
        var min = Math.floor(s/60) % 60;
        var sec = s % 60;
        if(hour < 10) {
            t = '0'+ hour + ":";
        } else {
            t = hour + ":";
        }

        if(min < 10){t += "0";}
        t += min + ":";
        if(sec < 10){t += "0";}
        t += sec.toFixed(0);
    }
    return t;
}

  setView(view) {
    this.emitter.emit('setView', view);
  }

  render() {
    return (
      <div className="account">
        <HeaderView>
          <BackToAppBtn setView={this.setView.bind(this)} />
        </HeaderView>
        <div className="container" style={{backgroundColor: 'rgb(16,37,66)'}}>
          <div style={{padding:'10px 0 20px',color:'#fff'}}>
          {this.state.userName} 
          <span style={{paddingLeft:'10px'}}></span>
          {this.state.userBalance}
          </div>
          <div style={{paddingTop:'5px'}}>
            <img src={require('../img/icon_FXPoints.png')} width="30px" alt="" />
            <div style={{
              backgroundImage:'url("../img/frame_FXPoints.png") center no-repeat', 
              display: 'inline-block',
              paddingLeft:'10px',
              height: '20px',
              verticalAlign: 'super',
              marginLeft: '-5px',
              zIndex: '0',
              position: 'relative',
              }}>  
              <img src={require('../img/FXPoints.png')} alt="" height="16px"/>
              <span style={{fontSize:'16px',padding: '10px',color:'#fff',verticalAlign: 'top'}}>{this.state.fxPoints}</span>
            </div>
          </div>
          <div style={{textAlign:'center',paddingTop:'50px'}}>
            <div>
              <img src={require('../img/icon_jackpot.png')} width="40px" alt="" />
              {/* <img src={require('../img/jackpot_1.png')} width="30px" alt="" /> */}
              <span style={{
                marginLeft: '20px',
                padding: '5px 20px 5px 16px',
                fontSize: '16px',
                position: 'relative',
                top: '-12px',
                zIndex: '0',
                right: '-10px',
                color:'#fff'
              }}>
                {this.state.airDropPot}
              </span>
              <img src={require('../img/coin_1.png')} width="35px" style={{ position: 'relative' ,zIndex: '1'}} alt="" />
            </div>
            <div style={{paddingTop:'20px'}}>
            <img src={require('../img/icon_countdown.png')} width="40px" alt="" />
              {/* <img src={require('../img/jackpot_1.png')} width="30px" alt="" /> */}
              <span style={{
                padding: '5px 20px 5px 16px',
                fontSize: '16px',
                position: 'relative',
                top: '-12px',
                zIndex: '0',
                right: '-10px',
                color:'#fff'
              }}>
                {this.sec_to_time(this.state.timeLeft)}
              </span>
        
            </div>
            <div style={{padding:'30px 0 30px'}}>
              <img src={require('../img/icon_FXPoints.png')} width="30px" alt="" />
              <span style={{color:'#fff',verticalAlign: 'super',fontSize:'16px',marginRight:'20px',padding: '10px'}}>{this.state.fxPoints}</span>
              <img src={require('../img/icon_dividens.png')} width="30px" alt="" />
              <span style={{color:'#fff',verticalAlign: 'super',fontSize:'16px',padding: '10px'}}>{this.state.dividends}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
CoinCenter.propTypes = {
  identityService: PropTypes.object
};

export default CoinCenter;
