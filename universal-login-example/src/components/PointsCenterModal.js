
import React, { Component }from 'react'
import { Button, Header, Image, Modal, Grid } from 'semantic-ui-react'
import Blockies from 'react-blockies';

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
    let { roundTime, start, end, avatar, fxPoints, dividends, airDropPot, userName, onWithdraw } = this.props;

    return (
      <Modal open={open} onClose={close} size={'fullscreen'}>
        <Modal.Header style={{textAlign:'center'}}>
          <div className="row align-items-center avatar_bar">
          <img src={avatar} />
            <div>
              <p className="user-id user-id-header">{userName}</p>
              <p className="wallet-address wallet-address-header">{fxPoints}积分</p>
            </div>
          </div>
          <div className="header_title">
            <img src={require('../img/game_center.png')} />
          </div>
          <img className="back_btn" src={require('../img/btn_back.png')} onClick={close} />
        </Modal.Header>
        <Modal.Content>
        <Grid columns={2} stackable textAlign='center' className="chest_box_grid">
          <Grid.Row>
            <Grid.Column className="chest_box" width='8'>
              <Grid columns={1} textAlign='center'>
                <Grid.Row>
                  <Grid.Column>
                    <div className="title">
                      <img src={require('../img/dividend_title.png')} />
                      <img className="btn_help" src={require('../img/btn_help.png')} />
                    </div>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
              <Grid columns={2} textAlign='center'>
                <Grid.Row>
                  <Grid.Column>
                    <div className="coin_box">
                      <img className="fx_points_icon" src={require('../img/icon_FXPoints.png')} />
                      <img className="fx_points_title" src={require('../img/fxjifen.png')} />
                      <div className="coin">{fxPoints}</div>
                    </div>
                  </Grid.Column>
                  <Grid.Column className="coin_box">
                    <div className="coin_box">
                      <img className="fx_points_icon" src={require('../img/icon_dividens.png')} />
                      <img className="fx_points_title" src={require('../img/wodefenhong.png')} />
                      <div className="coin">{dividends}</div>
                    </div>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
              <Grid columns={1} textAlign='center' style={{marginTop: '0px'}}>
                <Grid.Row>
                  <div className="redenvelope_bg">
                    <img className="redenvelope_btn" src={require('../img/redenvelopes_close.png')} onClick={onWithdraw} />
                  </div>
                </Grid.Row>
              </Grid>
              <div className="footer">
                <span style={{fontSize:'12px'}}>点击红包领取分红奖励</span> 
                <img src={require('../img/withdraw_btn.jpg')} />
              </div>
            </Grid.Column>
            <Grid.Column className="chest_box" width='8'>
              <Grid columns={1} textAlign='center'>
                <Grid.Row>
                  <Grid.Column>
                    <div className="title">
                      <img src={require('../img/lottery_title.png')} />
                      <img className="btn_help" src={require('../img/btn_help.png')} />
                    </div>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
              <Grid columns={1} textAlign='center'>
                <Grid.Row>
                  <Grid.Column className="coin_box" style={{maxWidth: '250px'}}>
                    <img className="fx_points_icon" src={require('../img/icon_countdown.png')} />
                    <img className="fx_points_title" src={require('../img/daojishi1.png')} />
                    <span className="left_time">{this.sec_to_time(end-parseInt(new Date().getTime()/1000))}</span>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
              <Grid columns={3} textAlign='center'>
                <Grid.Row className='awards_column'>
                  <Grid.Column>
                    <img src={require('../img/yidengjiang.png')} />
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
                    <img src={require('../img/erdengjiang.png')} />
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
                    <img src={require('../img/wdzjl.png')} />
                  </Grid.Column>
                  <Grid.Column>
                     0%
                  </Grid.Column>
                </Grid.Row>
              </Grid>
              <div className="footer">
                <img src={require('../img/lottery_btn.jpg')} />
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