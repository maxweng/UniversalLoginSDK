
import React, { Component }from 'react'
import { Button, Header, Image, Modal, Grid } from 'semantic-ui-react'
import Blockies from 'react-blockies';

class PointsCenterModal extends Component { 
  componentDidMount() {
      
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

  render() {
    let open = this.props.open;
    let close = this.props.close;
    let { fxPoints, dividends, airDropPot, timeLeft, onWithdraw } = this.props;

    return (
  
      <Modal open={open} onClose={close} size={'fullscreen'}>
        <Modal.Header style={{textAlign:'center'}}>
          <div className="row align-items-center" style={{float:'left'}}>
            <Blockies seed={'0xbF42E6bD8fA05956E28F7DBE274657c262526F3D'} size={8} scale={6} />
            <div>
              <p className="user-id user-id-header">678.fastx.eth</p>
              <p className="wallet-address wallet-address-header">{fxPoints}积分</p>
            </div>
          </div>
          <span style={{fontSize:'16px'}}>积分中心</span>
          <Button content='返回' basic onClick={close} style={{float:'right',padding: '16px 12px'}} size='mini'/>
        </Modal.Header>
        <Modal.Content>
        <Grid columns={2} stackable textAlign='center'>
          <Grid.Row>
            <Grid.Column className="chest_box" width='7'>
              <h4>分红拿到爽</h4>
              <div>
                <Grid columns={2} textAlign='center' style={{paddingTop:'40px'}}>
                  <Grid.Row>
                    <Grid.Column className="coin_box">
                      <img src={require('../img/icon_FXPoints.png')} />
                      <div className='title'>FX 积分</div>
                      <div className='coin'>{fxPoints}</div>
                    </Grid.Column>
                    <Grid.Column className="coin_box">
                      <img src={require('../img/icon_dividens.png')} />
                      <div className='title'>我的分红</div>
                      <div className='coin'>{dividends}</div>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Image src={require('../img/treasure_chest_small.png')} className="chest_img" onClick={onWithdraw}/>
                <span style={{fontSize:'12px'}}>点击宝箱领取分红奖励</span>
                <Button content='提现记录' basic size='mini'/>
              </div>
            </Grid.Column>
            <Grid.Column className="chest_box" width='7'>
              <h4>幸运大抽奖</h4>
              <div>
                <Grid columns={2} textAlign='center' style={{paddingTop:'40px'}}>
                  <Grid.Row>
                    <Grid.Column className="coin_box">
                      <img src={require('../img/icon_jackpot.png')} />
                      <div className='title'>奖池大奖</div>
                      <div className='coin'>{airDropPot}</div>
                    </Grid.Column>
                    <Grid.Column className="coin_box">
                      <img src={require('../img/icon_countdown.png')} />
                      <div className='title'>倒计时</div>
                      <div className='coin'>{this.sec_to_time(timeLeft)}</div>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <Image src={require('../img/treasure_chest_big.png')} className="chest_img"/>
                <div style={{display:'inline-block'}}>
                  <div style={{fontSize:'12px'}}>点击宝箱抽取大奖</div>
                  <div style={{fontSize:'12px'}}>剩余抽奖次数 0</div>
                </div>
                <Button content='抽奖记录记录' basic size='mini'/>
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