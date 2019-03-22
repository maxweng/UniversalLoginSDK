


import React, { Component }from 'react';
import Account from './Account';
import Balance from './Balance'
import HeaderView from '../views/HeaderView';
import { Button, Header, Image, Modal, Tab } from 'semantic-ui-react'

class AccountModal extends Component { 

    render() {
        let open = this.props.open;
        let close = this.props.close;
        let identityService = this.props.identityService;

        const panes = [
            { menuItem: '余额', render: () => <Tab.Pane attached={false} style={{marginTop:'0',padding:'0'}}>
                <Balance {...this.props} />
            </Tab.Pane> },
            { menuItem: '账户', render: () => <Tab.Pane attached={false}>
                <Account identityService={identityService} close={close}/>
            </Tab.Pane> }
        ]

        return (
            <Modal open={open} onClose={close} className="account-modal">
                <Modal.Content>
                    <button onClick={close} className="btn header-btn back-btn">
                        返回
                    </button>
                    <Tab menu={{ secondary: true, pointing: true }} panes={panes} className="no-border" />
                </Modal.Content>
            </Modal>
        )
    }
}

export default AccountModal