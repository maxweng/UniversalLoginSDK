
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
        <Grid columns={2} divided stackable textAlign='center'>
          <Grid.Row>
            <Grid.Column>
              <h4>分红拿到爽</h4>
              <Grid columns={2} textAlign='center' style={{paddingTop:'40px'}}>
                <Grid.Row>
                  <Grid.Column>
                    <div>FX积分</div>
                    <div>{fxPoints}</div>
                  </Grid.Column>
                  <Grid.Column>
                    <div>我的分红</div>
                    <div>{dividends}</div>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
              <Image src={require('../img/treasure_chest_small.png')} className="chest_img" onClick={onWithdraw}/>
              <span style={{fontSize:'12px',color:'#333'}}>点击宝箱领取分红奖励</span>
              <Button content='提现记录' basic size='mini' style={{float:'right'}}/>
            </Grid.Column>
            <Grid.Column>
              <h4>幸运大抽奖</h4>
              <Grid columns={2} textAlign='center' style={{paddingTop:'40px'}}>
                <Grid.Row>
                  <Grid.Column>
                    <div>奖池大奖</div>
                    <div>{airDropPot}</div>
                  </Grid.Column>
                  <Grid.Column>
                    <div>倒计时</div>
                    <div>{this.sec_to_time(timeLeft)}</div>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
              <Image src={require('../img/treasure_chest_big.png')} className="chest_img"/>
              <div style={{display:'inline-block'}}>
                <div style={{fontSize:'12px',color:'#333'}}>点击宝箱抽取大奖</div>
                <div style={{fontSize:'12px',color:'#333'}}>剩余抽奖次数 0</div>
              </div>
              <Button content='抽奖记录记录' basic size='mini' style={{float:'right'}}/>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        </Modal.Content>
      </Modal>
    )
  }
}

export default PointsCenterModal