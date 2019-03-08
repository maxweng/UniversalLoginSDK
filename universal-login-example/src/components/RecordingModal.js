

import React, { Component }from 'react'
import { Button, Header, Image, Modal, Grid, List } from 'semantic-ui-react'

class RecordingModal extends Component { 

    render() {
        let open = this.props.open;
        let close = this.props.close;

        return (
            <Modal open={open} onClose={close} className="record_modal">
                <Modal.Header style={{textAlign:'center'}}>
                    <img className="title left" src={require('../img/riqi.png')} />
                    <img className="title right" src={require('../img/huojiang.png')} />
                    <img className="close_btn" onClick={close} src={require('../img/close_btn.png')} />
                {/* <img help_title */}
                </Modal.Header>
                <Modal.Content>
                    <List>
                     2019/02/12 00:00    
                     <span style={{float:'right'}}>123444</span>
                    </List>
                    <List>
                    2019/02/12 00:00    123444
                    </List>
                    <List>
                    2019/02/12 00:00    123444
                    </List>
                    <List>
                    2019/02/12 00:00    123444
                    </List>
                </Modal.Content>
            </Modal>
        )
    }
}

export default RecordingModal