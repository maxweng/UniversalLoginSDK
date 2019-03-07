import React, {Component} from 'react';
import Iframe from 'react-iframe'
import { Button } from 'semantic-ui-react'
import MainScreenView from '../views/MainScreenView';
import HeaderView from '../views/HeaderView';
import RequestsBadge from './RequestsBadge';
import AccountLink from './AccountLink';
import ProfileIdentity from './ProfileIdentity';
import PropTypes from 'prop-types';
import PointsCenterModal from './PointsCenterModal';
import { ADDRCONFIG } from 'dns';
import { getQueryString, sleep } from '../utils/utils';

class MainScreen extends Component {
  constructor(props) {
    super(props);
    const {services} = this.props;
    this.historyService = services.historyService;
    this.ensNameService = services.ensNameService;
    this.clickService = services.clickService;
    this.tokenService = services.tokenService;
    this.fxPointsService = services.fxPointsService;
    this.identityService = services.identityService;
    this.IbankService = services.IbankService;
    this.gameUrl = services.config.gameUrl + '?access_code=' + getQueryString('access_code');
    
    this.state = {
      lastClick: '0', 
      lastPresser: 'nobody', 
      events: [], 
      loaded: false, 
      busy: false, 
      open: false,
      fxPoints: 0,
      dividends: 0,
      airDropPot: 0,
      timeLeft: 0,
      activeDrags: 0
    };
  }

  // async addCoin() {
  //   let signature = await this.identityService.signTrade(1)
  //   console.log(signature) 
  //   this.IbankService.trade(signature)
  // }

  async componentDidMount() {
    let signTrade = this.identityService.signTrade.bind(this.identityService)
    let showModal = this.show.bind(this)
    // showModal()
    window.addEventListener('message',async function(e){
      var data=e.data;
      if(data.type=='signTrade'){
        let signatureData = await signTrade(data.amount)
        e.source.postMessage({type:'signTrade',signatureData,'timestamp': data.timestamp},'*')
      }else if(data.type=='openGameCenterModal'){
        showModal()
      }
    })
    
    //this.historyService.subscribe(this.setState.bind(this));
    this.ensNameService.subscribe();
    //等待identityService.identity数据有了以后才继续往下执行
    await this.waitAccountLoadFinished();
    await this.updateFxPoints();
    let userInfo = await this.IbankService.getUserInfo();
    let playerInfo = await this.identityService.getPlayerInfo();
    let gamePool = await this.identityService.getFXPInfo();
    this.setState({
      userName: userInfo.user_name,
      fxPoints: parseFloat(playerInfo.balance).toFixed(2),
      dividends: parseFloat(playerInfo.aff+playerInfo.gen+playerInfo.win).toFixed(2),
      airDropPot: parseFloat(gamePool.airDropPot).toFixed(2),
      timeLeft: gamePool.timeLeft,
    })
    let that = this
    setInterval(function(){
      that.setState({
        timeLeft: that.state.timeLeft - 1
      })
    }, 1000)

    window.frames[0].postMessage({type:'userAddress',address:this.identityService.identity.address},'*')
  }

  async waitAccountLoadFinished() {
    while(!this.identityService.identity || !this.identityService.identity.address) {
        await sleep(1000);
    }

    return true;
  }

  show(event) {
    if(event)
    event.preventDefault()
    this.setState({ open: true })
  }

  close() {
    this.setState({ open: false })
  }

  setView(view) {
    const {emitter} = this.props.services;
    emitter.emit('setView', view);
  }

  async withdraw() {
    const result = await this.identityService.withdraw();
    console.log(result)
  }

  // async onClickerClick() {
  //   this.setState({busy: true});
  //   await this.clickService.click(() => this.setState({busy: false}));
  // }

  // async updateClicksLeft() {
  //   const {address} = this.identityService.identity;
  //   const balance = await this.tokenService.getBalance(address);
  //   const clicksLeft = parseInt(balance, 10);
  //   this.setState({
  //     clicksLeft
  //   });
  //   this.timeout = setTimeout(this.updateClicksLeft.bind(this), 2000);
  // }

  async updateFxPoints() {
    const {address} = this.identityService.identity;
    try {
      const balance = await this.fxPointsService.getBalance(address);
      const fxPoints = parseFloat(balance, 10).toFixed(2);
      this.setState({
        fxPoints
      });
    } catch (error) {
      console.log('get fxpoints balance error:',error)
    } finally{
      this.timeout = setTimeout(this.updateFxPoints.bind(this), 10000);
    }
  }

  componentWillUnmount() {
    this.ensNameService.unsubscribeAll();
    this.historyService.unsubscribeAll();
    clearTimeout(this.timeout);
  }

  render() {

    const pointsCenterModalProps = {
      userName: this.state.userName,
      fxPoints: this.state.fxPoints,
      dividends: this.state.dividends,
      airDropPot: this.state.airDropPot,
      timeLeft: this.state.timeLeft,
      onWithdraw: this.withdraw.bind(this),
    }
    
    return (
      <div>
        {/* <HeaderView>
          <ProfileIdentity
            userName={this.state.userName}
            type="identityHeader"
            identityService={this.props.services.identityService}
          />
          <RequestsBadge
            setView={this.setView.bind(this)}
            services={this.props.services}
          />
          <AccountLink setView={this.setView.bind(this)} />
        </HeaderView> */}
        {/* <img style={{cursor:'pointer',width:'50px',position:'absolute',top:'16px',right:'125px',zIndex:'100'}} onClick={this.show.bind(this)} src={require('../img/icon_FXPoints.png')} /> */}
        
        <PointsCenterModal close={this.close.bind(this)} open={this.state.open} {...pointsCenterModalProps}/>
        <Iframe url={this.gameUrl}
        width="100%"
        height={window.innerHeight.toString()}
        id="gameIframe"
        display="initial"
        position="relative"
        allowFullScreen/>
        
        {/* <h4>当前积分{this.state.fxPoints}</h4>
        <Button default onClick={this.addCoin.bind(this)}>点我加积分</Button> */}
        {/* <MainScreenView
          clicksLeft={this.state.clicksLeft}
          events={this.state.events}
          loaded={this.state.loaded}
          busy={this.state.busy}
          onClickerClick={this.onClickerClick.bind(this)}
          lastClick={this.state.lastClick}
          fxPoints={this.state.fxPoints}
        /> */}
      </div>
    );
  }
}

MainScreen.propTypes = {
  services: PropTypes.object
};

export default MainScreen;
