
import React, { Component }from 'react'
import { Button, Header, Image, Modal, Grid } from 'semantic-ui-react'

class PointsCenterModal extends Component { 
  componentDidMount() {
    
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
      userBalance, 
      userName, 
      onWithdraw,
      onShowDividend
    } = this.props;

    
    return (
      <Modal open={open} onClose={close} size={'fullscreen'}>
        <Modal.Header style={{textAlign:'center'}}>
          <div className="row align-items-center avatar_bar">
            <img src={avatar} />
            <div className="coin_bar">
              <p className="user-id user-id-header">{userName}</p>
              <img className="coin_icon" src={images.coinIcon} />
              <p className="wallet-address wallet-address-header">{userBalance['usdt']}</p>
              <img className="switch_icon" src={images.switchIcon} />
            </div>
          </div>
          <div className="header_title">
            <img src={images.gameCenter} />
          </div>
          <img className="back_btn" src={images.backBtn} onClick={close} />
        </Modal.Header>
        <Modal.Content>
        <Grid columns={2} textAlign='center' className="chest_box_grid">
          <Grid.Row>
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
              <Grid columns={2} textAlign='center'>
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
                      <div className="coin">{dividends}</div>
                    </div>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
              <Grid columns={1} textAlign='center' style={{marginTop: '0px'}}>
                <Grid.Row>
                  <div className="redenvelope_bg">
                    <img className="redenvelope_btn" src={images.redenvelopesCose} onClick={onWithdraw} />
                  </div>
                </Grid.Row>
              </Grid>
              <div className="footer">
                <span style={{fontSize:'12px',marginLeft:'-40px'}}>点击红包领取分红奖励</span> 
                <img src={images.withdrawBtn} />
              </div>
            </Grid.Column>
            <Grid.Column className="chest_box" width='8'>
              <Grid columns={1} textAlign='center'>
                <Grid.Row>
                  <Grid.Column>
                    <div className="title">
                      <img src={images.lotteryTitle} />
                      <img className="btn_help" src={images.helpBtn} />
                    </div>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
              <Grid columns={1} textAlign='center'>
                <Grid.Row>
                  <Grid.Column className="coin_box" style={{maxWidth: '250px'}}>
                    <img className="fx_points_icon" src={images.countdown} />
                    <img className="fx_points_title" src={images.daojishi} />
                    <span className="left_time">{this.sec_to_time(timeLeft)}</span>
                    <div className="progress_bar">
                      <img className="progress" style={{width:(((roundTime-timeLeft)/roundTime)*100)+'%'}} src={images.progressBar} />
                    </div>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
              <Grid columns={3} textAlign='center'>
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
              <Grid columns={3} textAlign='center'>
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
              <Grid columns={2} textAlign='center'>
                <Grid.Row className='winning_column'>
                  <Grid.Column>
                    <img src={images.wdzjl} />
                  </Grid.Column>
                  <Grid.Column>
                     15%
                  </Grid.Column>
                </Grid.Row>
              </Grid>
              <div className="footer">
                <img src={images.lotteryBtn} />
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