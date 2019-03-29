import React, {Component} from 'react';
import {utils} from 'ethers';
import Iframe from 'react-iframe'
import { Button } from 'semantic-ui-react'
import MainScreenView from '../views/MainScreenView';
import HeaderView from '../views/HeaderView';
import RequestsBadge from './RequestsBadge';
import AccountLink from './AccountLink';
import ProfileIdentity from './ProfileIdentity';
import PropTypes from 'prop-types';
import PointsCenterModal from './PointsCenterModal';
import DividendModal from './DividendModal';
import RecordingModal from './RecordingModal';
import AccountModal from './AccountModal';
import TransactionTipModal from './TransactionTipModal';
import { ADDRCONFIG } from 'dns';
import { getQueryString, sleep, isAddress } from '../utils/utils';

let coinIcon = require('../img/coin_icon.png')
let switchIcon = require('../img/switch.png')
let gameCenter = require('../img/game_center.png')
let backBtn = require('../img/btn_back.png')
let dividendTitle = require('../img/dividend_title.png')
let helpBtn = require('../img/btn_help.png')
let fxPoints = require('../img/icon_FXPoints.png')
let fxjifen = require('../img/fxjifen.png')
let dividensIcon = require('../img/icon_dividens.png')
let wodefenhong =  require('../img/wodefenhong.png')
let redenvelopesCose = require('../img/redenvelopes_close.png')
let withdrawBtn = require('../img/withdraw_btn.jpg')
let lotteryTitle = require('../img/lottery_title.png')
let countdown = require('../img/icon_countdown.png')
let daojishi = require('../img/daojishi1.png')
let yidengjiang = require('../img/yidengjiang.png')
let erdengjiang = require('../img/erdengjiang.png')
let wdzjl = require('../img/wdzjl.png')
let lotteryBtn = require('../img/lottery_btn.jpg')
let progressBar = require('../img/progress_bar.png')
let bonusWithdrawBtn = require('../img/bonus_withdraw.png')


let images = {
  coinIcon,
  switchIcon,
  gameCenter,
  backBtn,
  dividendTitle,
  helpBtn,
  fxPoints,
  fxjifen,
  dividensIcon,
  wodefenhong,
  redenvelopesCose,
  withdrawBtn,
  lotteryTitle,
  countdown,
  daojishi,
  yidengjiang,
  erdengjiang,
  wdzjl,
  lotteryBtn,
  progressBar,
  bonusWithdrawBtn
}

class MainScreen extends Component {
  constructor(props) {
    super(props);
    const {services} = this.props;
    this.historyService = services.historyService;
    this.ensNameService = services.ensNameService;
    //this.clickService = services.clickService;
    this.tokenService = services.tokenService;
    

    this.fxPointsService = services.fxPointsService;
    this.identityService = services.identityService;
    this.IbankService = services.IbankService;
    this.authorisationService = services.authorisationService;
    this.nativeNotificationService = services.nativeNotificationService;
    this.gameUrl = services.config.gameUrl + '?access_code=' + getQueryString('access_code');
    if(this.identityService.identity && this.identityService.identity.address)
    console.log('userAddress:',this.identityService.identity.address.toLowerCase())
    
    this.state = {
      lastClick: '0', 
      lastPresser: 'nobody', 
      events: [], 
      loaded: false, 
      busy: false, 
      open: false,
      openDividend: false,
      openRecording: false,
      openAccountModal: false,
      openTransactionTip: false,
      fxPoints: 0,
      dividends: 0,
      bonus: '',
      airDropPot: 0,
      roundTime: 0,
      start: 0,
      end: 0,
      timeLeft: 0,
      activeDrags: 0,
      avatar: require('../img/user.svg'),
      amount: 0,
      loading: false,
      to: '',
      balance: 0,
      transactionMsg: ''
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
    let that = this
    showModal()
    window.addEventListener('message',async function(e){
      var data=e.data;
      if(data.type=='signTrade'){
        let signatureData = await signTrade(data.amount)
        e.source.postMessage({type:'signTrade',signatureData,'timestamp': data.timestamp},'*')
      }else if(data.type=='openGameCenterModal'){
        showModal()
      }else if(data.type=='avatar'){
        that.setState({
          avatar: data.url
        })
      }
    })

    const {address} = this.identityService.identity;
    this.subscription = this.authorisationService.subscribe(
      address,
      this.onAuthorisationChanged.bind(this)
    );
    
    //this.historyService.subscribe(this.setState.bind(this));
    this.ensNameService.subscribe();
    //等待identityService.identity数据有了以后才继续往下执行
    await this.waitAccountLoadFinished();
    await this.updateFxPoints();
    try {
      let userInfo = await this.IbankService.getUserInfo();
      let playerInfo = await this.identityService.getPlayerInfo();
      let gamePool = await this.identityService.getFXPInfo();
      let timeLeft = gamePool.end-parseInt(new Date().getTime()/1000);
      this.setState({
        userName: userInfo.user_name,
        fxPoints: parseFloat(playerInfo.keys).toFixed(2),
        dividends: parseFloat(playerInfo.balance),
        probability: playerInfo.probability,
        airDropPot: parseFloat(gamePool.airDropPot).toFixed(2),
        roundTime: gamePool.roundTime,
        start: gamePool.start,
        end: gamePool.end,
        timeLeft
      })
    } catch (error) {
      console.log(error)
    }

    setInterval(function(){
      that.setState({
        timeLeft: that.state.timeLeft - 1
      })
    }, 1000)
    
    if(window.frames[0])
    window.frames[0].postMessage({type:'userAddress',address:this.identityService.identity.address},'*')
  }

  componentWillUnmount() {
    this.subscription.remove();
  }

  onAuthorisationChanged(authorisations) {
    this.setState({requests: authorisations.length});
    if (authorisations.length > 0) {
      console.log({type:'requests',count:authorisations.length})
      //this.nativeNotificationService.notifyLoginRequest(authorisations[0].deviceInfo);
      window.frames[0].postMessage({type:'requests',count:authorisations.length},'*')
    }
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

  showDividend(event) {
    if(event)
    event.preventDefault()
    this.setState({ openDividend: true })
  }

  closeDividend() {
    this.setState({ openDividend: false })
  }

  showTransactionTip(event) {
    if(event)
    event.preventDefault()
    this.setState({ openTransactionTip: true })
  }

  closeTransactionTip() {
    this.setState({ openTransactionTip: false })
  }

  showAccount(event) {
    if(event)
    event.preventDefault()
    this.setState({ openAccountModal: true })
  }

  closeAccount() {
    this.setState({ openAccountModal: false })
  }

  showRecording(event) {
    if(event)
    event.preventDefault()
    this.setState({ openRecording: true })
  }

  closeRecording() {
    this.setState({ openRecording: false })
  }

  setView(view) {
    const {emitter} = this.props.services;
    emitter.emit('setView', view);
  }

  async withdraw() {
    try {
      const amount = utils.parseEther(parseInt(this.state.dividends*100000)/100000 + '')
      if(amount.lte(0))return
      this.setState({
        transactionMsg: '交易已发送，请等待片刻...'
      })
      this.showTransactionTip();
      const result = await this.identityService.withdraw(amount);
      if(result){
        this.setState({
          transactionMsg: '交易已完成。点击头像进入钱包页面，查看分红奖励是否到账'
        })
      }else{
        this.setState({
          transactionMsg: '交易失败'
        })
      }
      let playerInfo = await this.identityService.getPlayerInfo();
   
      this.setState({
        fxPoints: parseFloat(playerInfo.keys).toFixed(2),
        dividends: parseFloat(playerInfo.balance),
        probability: playerInfo.probability,
      })
    } catch (error) {
      alert(error)
    }
  }

  async bonusWithdraw(roundId) {
    try {
      await this.identityService.bonusWithdraw(this.state.bonus, roundId);
    } catch (error) {
      alert(error)
    }
  }

  async updateFxPoints() {
    const {address} = this.identityService.identity;
    try {
      let fxPoints = await this.fxPointsService.getBalance(address);
      fxPoints = parseFloat(fxPoints, 10).toFixed(2);
      let balance = await this.identityService.getBalance(address);
      balance = parseFloat(balance, 10).toFixed(4);
      let playerInfo = await this.identityService.getPlayerInfo();
      this.setState({
        fxPoints,
        balance,
        dividends: parseFloat(playerInfo.balance),
      });
    } catch (error) {
      console.log(error)
    } finally{
      this.timeout = setTimeout(this.updateFxPoints.bind(this), 10000);
    }
  }

  componentWillUnmount() {
    this.ensNameService.unsubscribeAll();
    this.historyService.unsubscribeAll();
    clearTimeout(this.timeout);
  }

  onChangeAmount(e, target) {
    this.setState({
      amount: parseFloat(target.value)
    })
  }

  onChangeTo(e, target) {
    this.setState({
      to: target.value
    })
  }

  async onConfirmSendTransaction() {
    if (!isAddress(this.state.to)) {
      alert('Destenation address invalid')
      return
    }

    if (this.state.amount <= 0) {
        alert('Amount must be possitive')
        return
    }

    this.setState({
      'loading': true
    })
    const transaction = await this.identityService.sendTransaction(this.state.to, this.state.amount)
    console.log(transaction)

    const {address} = this.identityService.identity;
    let balance = await this.identityService.getBalance(address);
    balance = parseFloat(balance, 10).toFixed(4);
    this.setState({
      'loading': false,
      balance,
      amount: 0,
      to: '',
    })
    alert('转账成功')
  }

  render() {
    const pointsCenterModalProps = {
      images,
      userName: this.state.userName,
      avatar: this.state.avatar,
      fxPoints: this.state.fxPoints,
      dividends: this.state.dividends,
      airDropPot: this.state.airDropPot,
      roundTime: this.state.roundTime,
      start: this.state.start,
      end: this.state.end,
      timeLeft: this.state.timeLeft,
      services: this.props.services,
      probability: this.state.probability,
      onWithdraw: this.withdraw.bind(this),
      onShowDividend: this.showDividend.bind(this),
      onShowRecording: this.showRecording.bind(this),
      onShowAccount: this.showAccount.bind(this),
      onBonusWithdraw: this.bonusWithdraw.bind(this)
    }

    const AccountModalProps = {
      amount: this.state.amount,
      loading: this.state.loading,
      to: this.state.to,
      balance: this.state.balance,
      identityService: this.props.services.identityService,
      onChangeAmount: this.onChangeAmount.bind(this),
      onChangeTo: this.onChangeTo.bind(this),
      onConfirmSendTransaction: this.onConfirmSendTransaction.bind(this),
    }
    
    return (
      <div className="back-bg">
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
        {/* <Account identityService={services.identityService}/> */}
        <AccountModal close={this.closeAccount.bind(this)} open={this.state.openAccountModal} identityService={this.props.services.identityService}/>
        <RecordingModal close={this.closeRecording.bind(this)} open={this.state.openRecording}/>
        <DividendModal close={this.closeDividend.bind(this)} open={this.state.openDividend} />
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
          fxPoints={this.state.fxPoints}/> */}
      </div>
    );
  }
}

MainScreen.propTypes = {
  services: PropTypes.object
};

export default MainScreen;
