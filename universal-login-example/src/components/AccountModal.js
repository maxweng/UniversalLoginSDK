


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
            { menuItem: 'balance', render: () => <Tab.Pane attached={false}>
                <Balance {...this.props} />
            </Tab.Pane> },
            { menuItem: 'account', render: () => <Tab.Pane attached={false}>
                <Account identityService={identityService} close={close}/>
            </Tab.Pane> }
        ]

        return (
            <Modal open={open} onClose={close} className="account-modal">
                <Modal.Content>
                    {/* <HeaderView>
                        <button onClick={close} className="btn header-btn">
                            BACK
                        </button>
                    </HeaderView> */}
                    <button onClick={close} className="btn header-btn back-btn">
                        BACK
                    </button>
                    <Tab menu={{ secondary: true, pointing: true }} panes={panes} className="no-border" />
                </Modal.Content>
            </Modal>
        )
    }
}

export default AccountModal