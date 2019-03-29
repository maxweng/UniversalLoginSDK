
import React, { Component }from 'react'
import { Button, Header, Image, Modal, Grid } from 'semantic-ui-react'

import RequestsBadge from './RequestsBadge';

class PointsCenterModal extends Component { 
  setView(view) {
    const {emitter} = this.props.services;
    emitter.emit('setView', view);
  }

  sec_to_time(s) {
    if(s<=0){
      return '00H 00M 00S'
    }
    var t;
    if(s > -1){
        var hour = Math.floor(s/3600);
        var min = Math.floor(s/60) % 60;
        var sec = s % 60;
        if(hour < 10) {
            t = '0'+ hour + "H ";
        } else {
            t = hour + "H ";
        }

        if(min < 10){t += "0";}
        t += min + "M ";
        if(sec < 10){t += "0";}
        t += sec.toFixed(0)+ "S ";
    }
    return t;
  }

  getProgressWidth(roundTime, timeLeft) {
    if(timeLeft<0)timeLeft = 0;
    if(!roundTime)return 100;
    return ((roundTime-timeLeft)/roundTime)*100;
  }

  render() {
    let open = this.props.open;
    let close = this.props.close;
    let { 
      images,
      timeLeft, 
      roundTime, 
      start, 
      end, 
      avatar, 
      fxPoints, 
      dividends, 
      airDropPot, 
      userName,
      services,
      probability,
      roundId,
      onWithdraw,
      onShowDividend,
      onShowRecording,
      onShowAccount,
      onBonusWithdraw
    } = this.props;

    let userAddr, str = services.identityService.identity.address;
    if(str)
    userAddr = str.slice(0,6)+'......'+str.slice(str.length-6,str.length)

    return (
      <Modal open={open} onClose={close} size={'fullscreen'}>
        <Modal.Header style={{textAlign:'center'}}>
          <div className="row align-items-center avatar_bar">
            <img src={avatar} onClick={onShowAccount}/>
            <div className="coin_bar">
              <p className="user-id user-id-header" style={{textAlign: 'left',paddingLeft:'5px'}}>{userName || '玩家'}</p>
              {/* <img className="coin_icon" src={images.coinIcon} /> */}
              <p className="wallet-address wallet-address-header">{userAddr}</p>
              {/* <img className="switch_icon" src={images.switchIcon} /> */}
            </div>
          </div>
          <div style={{position: 'absolute',left: '38px',top:'-10px'}}>
            <RequestsBadge
              setView={this.setView.bind(this)}
              services={this.props.services}
            />
          </div>
          <div className="header_title">
            <img src={images.gameCenter} />
          </div>
          <img className="back_btn" src={images.backBtn} onClick={close} />
        </Modal.Header>
        <Modal.Content style={{padding: '10px'}}>
          <Grid columns={2} textAlign='center' className="chest_box_grid" style={{margin:'0'}}>
            <Grid.Row style={{padding: '0'}}>
              <Grid.Column className="chest_box" width='8'>
                <Grid columns={1} textAlign='center'>
                  <Grid.Row>
                    <Grid.Column>
                      <div className="title">
                        <img src={images.dividendTitle} />
                        <img className="btn_help" src={images.helpBtn} onClick={onShowDividend} />
                      </div>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Grid columns={2} textAlign='center' style={{ marginTop: '0'}}>
                  <Grid.Row>
                    <Grid.Column>
                      <div className="coin_box">
                        <img className="fx_points_icon" src={images.fxPoints} />
                        <img className="fx_points_title" src={images.fxjifen} />
                        <div className="coin">{fxPoints}</div>
                      </div>
                    </Grid.Column>
                    <Grid.Column className="coin_box">
                      <div className="coin_box">
                        <img className="fx_points_icon" src={images.dividensIcon} />
                        <img className="fx_points_title" src={images.wodefenhong} />
                        <div className="coin">{dividends.toFixed(4)}</div>
                      </div>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Grid columns={1} textAlign='center' style={{marginTop: '0px'}}>
                  <Grid.Row style={{paddingTop: '0px'}}>
                    <div className="redenvelope_bg">
                      <img className="redenvelope_btn" src={images.redenvelopesCose} onClick={onWithdraw} />
                    </div>
                  </Grid.Row>
                </Grid>
                <div className="footer">
                  <span style={{fontSize:'12px',marginLeft:'-40px'}}>点击红包领取分红奖励</span> 
                  <img src={images.withdrawBtn} onClick={onShowRecording}/>
                </div>
              </Grid.Column>
              <Grid.Column className="chest_box" width='8'>
                <Grid columns={1} textAlign='center'>
                  <Grid.Row>
                    <Grid.Column>
                      <div className="title">
                        <img src={images.lotteryTitle} />
                        <img className="btn_help" src={images.helpBtn} onClick={onShowDividend} />
                      </div>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Grid columns={1} textAlign='center' style={{ marginTop: '0'}}>
                  <Grid.Row>
                    <Grid.Column className="coin_box" style={{maxWidth: '250px'}}>
                      <img className="fx_points_icon" src={images.countdown} />
                      <img className="fx_points_title" src={images.daojishi} />
                      <span className="left_time">{this.sec_to_time(timeLeft)}</span>
                      <div className="progress_bar">
                        <img className="progress" style={{width:this.getProgressWidth(roundTime,timeLeft)+'%'}} src={images.progressBar} />
                      </div>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Grid columns={3} textAlign='center' style={{marginTop: '0px',height:'46px'}}>
                  <Grid.Row className='awards_column'>
                    <Grid.Column>
                      <img src={images.yidengjiang} />
                    </Grid.Column>
                    <Grid.Column>
                        X1 名
                    </Grid.Column>
                    <Grid.Column>
                        {(parseFloat(airDropPot*0.45)).toFixed(2)}
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Grid columns={3} textAlign='center' style={{height:'46px'}}>
                  <Grid.Row className='awards_column'>
                    <Grid.Column>
                      <img src={images.erdengjiang} />
                    </Grid.Column>
                    <Grid.Column>
                        X10 名
                    </Grid.Column>
                    <Grid.Column>
                        {(parseFloat(airDropPot*0.045)).toFixed(2)}
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Grid columns={2} textAlign='center' style={{marginTop: '0px',height: '107px'}}>
                  <Grid.Row className='winning_column'>
                    <Grid.Column>
                      <img src={images.wdzjl} />
                    </Grid.Column>
                    <Grid.Column>
                      {probability} %
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <div className="footer">
                  <img src={images.bonusWithdrawBtn} onClick={onBonusWithdraw.bind(this,roundId)} style={{'left': '15px'}}/>
                  <img src={images.lotteryBtn} onClick={onShowRecording}/>
                </div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Modal.Content>
      </Modal>
    )
  }
}

export default PointsCenterModal