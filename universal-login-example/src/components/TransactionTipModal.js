

import React, { Component }from 'react'
import { Button, Header, Image, Modal, Grid, List } from 'semantic-ui-react'

class TransactionTipModal extends Component { 
    render() {
        const open = this.props.open;
        const close = this.props.close;
        const transactionMsg = this.props.transactionMsg;

        return (
            <Modal open={open} onClose={close} className="help_modal" style={{color:'white'}}>
                <Modal.Header style={{textAlign:'center'}}>
                    <span className="title" style={{color:'white'}}>提示</span>
                    <img className="close_btn" onClick={close} src={require('../img/close_btn.png')} />
                </Modal.Header>
                <Modal.Content>
                    <div style={{padding:'40px'}}>
                        {transactionMsg}
                    </div>
                </Modal.Content>
            </Modal>
        )
    }
}

export default TransactionTipModal