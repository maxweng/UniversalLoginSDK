//====================================================================================================================//
//  ,---..-.   .-.,---.   .---.  ,-..-. .-. _______  .---.
//  | .-' ) \_/ / | .-.\ / .-. ) |(||  \| ||__   __|( .-._)
//  | `-.(_)   /  | |-' )| | |(_)(_)|   | |  )| |  (_) \
//  | .-'  / _ \  | |--' | | | | | || |\  | (_) |  _  \ \
//  | |   / / ) \ | |    \ `-' / | || | |)|   | | ( `-'  )
//  )\|  `-' (_)-'/(      )---'  `-'/(  (_)   `-'  `----'
// (__)          (__)    (_)       (__)
//
//   _, _, ,  , ___,_  _    _,___,
//  /  / \,|\ |' | |_)'|\  / ' |
// '\_'\_/ |'\|  |'| \ |-\'\_  |
//    `'   '  `  ' '  `'  `  ` '
//
// 2019.3

pragma solidity ^0.5.0;

import "./SafeMath.sol";
import "./KeyCalc.sol";

/**
 * @dev The main contract
 */
contract FXPoints {
    using SafeMath for uint256;
    using KeyCalc for uint256;

    // ___
    //  |    ._   _   _
    //  | \/ |_) (/_ _>
    //    /  |

    struct TeamMember {
        uint256 percentOfTeamDividends; // Percent from team dividends
        uint256 withdrawnEth;           // The amount have already withdrawn by the team member
    }

    struct Player {
        address addr;
        address aff;

        uint256 eth;
        uint256 ico;
        uint256 keys;
        uint256 deadEth;
        bool jackpotWithdrawn;

        uint256 firstJSID;
        uint256 lastJSID;
    }

    struct JackpotShare {
        uint256 pos;
        uint256 eth;
        uint256 nextJSID;
    }

    struct Jackpot {
        uint256 magicNum;
        uint256 startTime;
        uint256 periodSecs;
        uint256 eth;
        mapping (uint256 => address) awardPlayers;
        uint256 nextJSID;
        uint256 blockOfLastBuy;
        mapping (uint256 => JackpotShare) jackpotShares;
    }

    struct JackpotWinner {
        uint256 eth;
    }

    struct Game {
        uint256 startTime;
        bool active;

        uint256 periodSecsOfICOPhase;
        uint256 ico;

        uint256 keys;
        uint256 profitPerKey;

        uint256 teamEth;
        uint256 dividendsEth;

        mapping (address => Player) players;

        uint256 jackpotID;
        mapping (uint256 => Jackpot) jackpots;
    }

    // |\/|  _  ._ _  |_   _  ._ _
    // |  | (/_ | | | |_) (/_ | _>

    address payable private owner;
    address private manager;

    mapping (address => TeamMember) teamMembers;
    uint256 totalTeamEth;
    uint256 totalTeamDividendsPercent;

    Game game;

    //  _
    // |_   _ .__|_ _
    // |_\/(/_| ||__>
    //

    /**
     * @dev Emit on a team member is added
     * @param memb Address of new member
     * @param percent How many profit can be withdrawn by this team member
     */
    event TeamMemberIsAdded(address memb, uint256 percent);

    /**
     * @dev Emit on the game is activated
     */
    event GameIsActivated();

    /**
     * @dev Emit on a new payment received during ICO phase
     * @param player Address of the player
     * @param eth Amount to buy
     * @param aff Address of the affiliate
     * @param teamEth Amount of team dividends
     * @param jackpotEth Amount are added to jackpot
     * @param dividendsEth Amount are added to dividends
     */
    event BuyOnICOPhase(
        address player, uint256 eth, address aff, uint256 teamEth, uint256 jackpotEth, uint256 dividendsEth);

    /**
     * @dev Emit on keys are purchased
     * @param player Address of the player
     * @param eth Amount of eth are transferred to contract
     * @param keys Amount of keys are bought
     */
    event KeysAreBought(address player, uint256 eth, uint256 keys);

    /**
     * @dev Emit on a team member withdrawal is applied.
     * @param memberAddr Address of member
     * @param eth Amount are withdrew
     */
    event TeamMemberWithdrawEvent(address memberAddr, uint256 eth);

    /**
     * @dev Emit on a withdrawal is processed successfully
     * @param playerAddr Address of player
     * @param eth Amount are withdrew
     */
    event WithdrawEvent(address playerAddr, uint256 eth);

    /**
     * @dev Emit on a new jackpot is running
     * @param magicNum Hash value of the random number
     * @param periodSecs Total time are used during the jackpot period
     * @param startTime The time of the block
     * @param jackpotID The ID value of the jackpot
     */
    event NewJackpotEvent(uint256 magicNum, uint256 periodSecs, uint256 startTime, uint256 jackpotID);

    /**
     * @dev Emit on a player withdraw the jackpot successfully
     * @param playerAddr The player address
     * @param eth Amount of the jackpot are withdrawn
     */
    event withdrawJackpotEvent(address playerAddr, uint256 eth);

    //              _
    // |\/| _  _|o_|_o _ ._
    // |  |(_)(_|| | |(/_|
    //

    modifier isOwner() {
        require(msg.sender == owner, "Only owner!");
        _;
    }

    modifier isManager() {
        require(msg.sender == manager, "Only manager!");
        _;
    }

    modifier isTeamMember(address _teamMemberAddr) {
        require(teamMembers[_teamMemberAddr].percentOfTeamDividends > 0, "Team member is required!");
        _;
    }

//   __
//==/=============================/================/====/============|================================================//
// ( __  ___  ___  ___  ___  ___ (       _ _  ___ (___ (___  ___  ___| ___
// |   )|___)|   )|___)|   )|   )|      | | )|___)|    |   )|   )|   )|___
// |__/ |__  |  / |__  |    |__/||      |  / |__  |__  |  / |__/ |__/  __/

    /**
     * @dev Constructor of the contract
     */
    constructor() public {
        owner = msg.sender;
        manager = msg.sender;
    }

    /**
     * @dev This function will allow transaction of funds
     */
    function () external payable {
        require(msg.data.length == 0, "Prevent invalid calls!");
    }

    /**
     * @dev Destroy current contract and returns all funds to owner
     */
    function kill() public isOwner {
        selfdestruct(owner);
    }

    /**
     * @dev Assign manager account
     */
    function setManager(address _manager) public isOwner {
        manager = _manager;
    }

    /**
     * @dev Set current game active status to `active`
     */
    function activateGame(uint256 _periodSecsOfICOPhase) public isManager {
        require(game.active == false, "Game is already activated!");
        require(totalTeamDividendsPercent == 100, "Wrong percent value of team dividends!");

        game.startTime = now;
        game.periodSecsOfICOPhase = _periodSecsOfICOPhase;
        game.active = true;

        emit GameIsActivated();
    }

    /**
     * @dev Read the active status of current game
     * @return Returns true if current game is active
     */
    function getActive() public view returns (bool) {
        return game.active;
    }

//   __
//==/|================================/====/============|=============================================================//
// ( |  ___  ___  _ _       _ _  ___ (___ (___  ___  ___| ___
//   | |___)|   )| | )     | | )|___)|    |   )|   )|   )|___
//   | |__  |__/||  /      |  / |__  |__  |  / |__/ |__/  __/

    /**
     * @dev Add a team member to split the dividends
     * @param _memberAddr The team member address
     * @param _percent The percent to split
     */
    function addTeamMember(address _memberAddr, uint256 _percent) public isManager {
        require(
            _percent > 0 && totalTeamDividendsPercent <= 100 && _percent <= 100 - totalTeamDividendsPercent,
            "Invalid dividends percent!"
        );

        TeamMember storage _teamMember = teamMembers[_memberAddr];
        require(_teamMember.percentOfTeamDividends == 0, "Team member has already been added!");

        _teamMember.percentOfTeamDividends = _percent;
        totalTeamDividendsPercent += _percent;

        emit TeamMemberIsAdded(_memberAddr, _percent);
    }

    /**
     * @dev Returns the total percent of team dividends
     * @return Percent value
     */
    function getTotalTeamDividendsPercent() public view returns (uint256) {
        return totalTeamDividendsPercent;
    }

    /**
     * @dev Calculate available dividends of a team member
     * @param _teamMemberAddr Team member address
     * @return Dividends can be withdrawn
     */
    function calcAvailableTeamEth(address _teamMemberAddr) public isTeamMember(_teamMemberAddr) view returns(uint256) {
        TeamMember storage _teamMember = teamMembers[_teamMemberAddr];
        return (totalTeamEth.mul(_teamMember.percentOfTeamDividends) / 100).sub(_teamMember.withdrawnEth);
    }

    /**
     * @dev Withdraw team dividends of team member.
     * @param _eth How many funds need to be withdrawn
     */
    function withdrawTeamDividends(uint256 _eth) public isTeamMember(msg.sender) {
        TeamMember storage _teamMember = teamMembers[msg.sender];

        uint256 _availableEth = calcAvailableTeamEth(msg.sender);
        require(_eth <= _availableEth, "Exceeded the amount!");

        msg.sender.transfer(_eth);
        _teamMember.withdrawnEth = _teamMember.withdrawnEth.add(_eth);

        emit TeamMemberWithdrawEvent(msg.sender, _eth);
    }

//====|===========/==============/===================/====/============|==============================================//
//    | ___  ___ (     ___  ___ (___       _ _  ___ (___ (___  ___  ___| ___
//    )|   )|    |___)|   )|   )|         | | )|___)|    |   )|   )|   )|___
//  _/ |__/||__  | \  |__/ |__/ |__       |  / |__  |__  |  / |__/ |__/  __/

    /**
     * @dev Kernel function to process jackpot
     * @param _game Game object
     * @param _player Player object
     * @param _jackpotEth Amount of jackpot share
     * @return Returns the total amount of jackpot
     */
    function jackpotProc(Game storage _game, Player storage _player, uint256 _jackpotEth) private returns (uint256) {
        // We need to deal with the jackpot here
        uint256 _jackpotID = _game.jackpotID;
        Jackpot storage _jackpot = _game.jackpots[_jackpotID];

        if (_jackpotID > 0 && _jackpot.magicNum != 0 && _jackpot.startTime.add(_jackpot.periodSecs) > now) {
            uint256 _jsID = _jackpot.nextJSID;
            _jackpot.nextJSID = _jsID.add(1);

            // Initialize jackpot share data
            JackpotShare storage _js = _jackpot.jackpotShares[_jsID];
            _js.pos = _jackpot.eth;
            _js.eth = _jackpotEth;
            _jackpot.eth = _jackpot.eth.add(_jackpotEth);

            // First share for current player?
            if (_player.firstJSID == 0) {
                _player.firstJSID = _jsID;
                _player.lastJSID = _jsID;
            } else {
                JackpotShare storage _lastJs = _jackpot.jackpotShares[_player.lastJSID];
                _lastJs.nextJSID = _jsID;
                _player.lastJSID = _jsID;
            }
            _jackpot.blockOfLastBuy = block.number;
            return _jackpot.eth;
        } else {
            return 0;
        }
    }

    /**
     * @dev Return the status of current jackpot
     * @return True if jackpot is running
     */
    function getJackpotIsRunning() public view returns (bool) {
        require(game.active, "The game status is not active!");
        uint256 _jackpotID = game.jackpotID;

        if (_jackpotID == 0) {
            return false;
        }

        Jackpot storage _jackpot = game.jackpots[_jackpotID];
        return _jackpot.startTime.add(_jackpot.periodSecs) > now;
    }

    /**
     * @dev Start a new round of jackpot
     * @param _magicNum The hash value of the random number, this number will be used for reveal the jackpot result
     * @param _periodSecs How many seconds during the jackpot period
     */
    function startNewJackpot(uint256 _magicNum, uint256 _periodSecs) public isManager {
        require(game.active, "The game status is not active!");
        uint256 _jackpotID = game.jackpotID;

        uint256 _remainsEth = 0;
        if (game.jackpotID > 0) {
            // Need to ensure that no jackpot is running
            Jackpot storage _jackpot = game.jackpots[_jackpotID];
            require(_jackpot.startTime.add(_jackpot.periodSecs) < now, "Jackpot is not finished!");
            _remainsEth = _jackpot.eth.mul(10) / 100; // 10% go to next round
        }

        // Increase jackpotID to start a new round of jackpot
        ++_jackpotID;
        game.jackpotID = _jackpotID;

        Jackpot storage _jackpot = game.jackpots[_jackpotID];
        _jackpot.eth = _remainsEth;
        _jackpot.magicNum = _magicNum;
        _jackpot.startTime = now;
        _jackpot.periodSecs = _periodSecs;
        _jackpot.nextJSID = 1; // Initialize jackpot share ID to 1

        emit NewJackpotEvent(_magicNum, _periodSecs, now, game.jackpotID);
    }

    /**
     * @dev Get jackpot details
     * @return _retJackpotID Current jackpot ID
     * @return _retStartTime When the jackpot starts up
     * @return _retPeriodSecs The seconds of the jackpot period
     */
    function getJackpotInfo() public view
        returns (uint256 _retJackpotID, uint256 _retStartTime, uint256 _retPeriodSecs) {
        _retJackpotID = game.jackpotID;
        Jackpot storage _jackpot = game.jackpots[_retJackpotID];
        _retStartTime = _jackpot.startTime;
        _retPeriodSecs = _jackpot.periodSecs;
    }

    /**
     * @dev Returns the amount of eth in jackpot
     * @return Amount of eth
     */
    function getJackpotEth() public view returns (uint256) {
        require(game.jackpotID > 0, "No valid jackpot!");
        Jackpot storage _jackpot = game.jackpots[game.jackpotID];
        return _jackpot.eth;
    }

    /**
     * @dev Calculate jackpot result with random number
     * @param _randNum Random number
     * @return Returns the result
     */
    function calcJackpotResult(uint256 _randNum) public view returns (uint256) {
        Jackpot storage _jackpot = game.jackpots[game.jackpotID];

        uint256 _blockOfLastBuy = _jackpot.blockOfLastBuy;
        require(block.number > _blockOfLastBuy, "Too early to withdraw, wait until next block is generated!");

        uint256 _magicNum = uint256(keccak256(abi.encodePacked(_randNum)));
        require(_magicNum == _jackpot.magicNum, "Invalid random number!");

        // Calculate result number
        uint256 _resultHash = uint256(keccak256(abi.encodePacked(_randNum, blockhash(_blockOfLastBuy))));
        uint256 _result = _resultHash % _jackpot.eth;

        return _result;
    }

    /**
     * @dev Withdraw jackpot profit
     * @param _randNum Use this random number to verify and withdraw the eth
     */
    function withdrawJackpot(uint256 _randNum) public {
        address payable _playerAddr = msg.sender;

        Player storage _player = game.players[_playerAddr];
        require(_player.addr != address(0), "You are not a valid player!");

        uint256 _jackpotID = game.jackpotID;
        require(_jackpotID > 0, "Invalid jackpot!");

        Jackpot storage _jackpot = game.jackpots[_jackpotID];
        require(_jackpot.startTime.add(_jackpot.periodSecs) < now, "Jackpot is not finished!");

        uint256 _jackpotEth = _jackpot.eth;
        require(_jackpotEth > 0, "No eth in jackpot!");

        uint256 _blockOfLastBuy = _jackpot.blockOfLastBuy;
        require(block.number > _blockOfLastBuy, "Too early to withdraw, wait until next block is generated!");

        uint256 _magicNum = uint256(keccak256(abi.encodePacked(_randNum)));
        require(_magicNum == _jackpot.magicNum, "Invalid random number!");

        // Calculate the first result number
        uint256 _resultHash = uint256(keccak256(abi.encodePacked(_randNum, blockhash(_blockOfLastBuy))));
        uint256 _result = _resultHash % _jackpotEth;

        // Is current player a winner?
        uint256 _awardIdx = 0;
        mapping (uint256 => address) storage _awardPlayers = _jackpot.awardPlayers;
        while (_awardIdx <= 10) {
            if (_awardPlayers[_awardIdx] == address(0)) {
                uint256 _currJSID = _player.firstJSID;
                JackpotShare storage _js = _jackpot.jackpotShares[_currJSID];
                while (_currJSID > 0) {
                    if (_result >= _js.pos && _result < _js.pos.add(_js.eth)) {
                        uint256 _awardEth;
                        if (_awardIdx == 0) {
                            _awardEth = _jackpotEth.mul(45) / 100;
                        } else {
                            _awardEth = _jackpotEth.mul(45) / 1000;
                        }
                        _playerAddr.transfer(_awardEth);
                        _awardPlayers[_awardIdx] = _playerAddr; // Record it.
                        emit withdrawJackpotEvent(_playerAddr, _awardEth);
                        break;
                    }
                    // Next share
                    _currJSID = _js.nextJSID;
                    _js = _jackpot.jackpotShares[_currJSID];
                }
            }
            // Next
            ++_awardIdx;
            _resultHash = uint256(keccak256(abi.encodePacked(_resultHash)));
            _result = _resultHash % _jackpotEth;
        }
    }

//     __   __
//==/=/====/==|================/====/============|====================================================================//
// ( (    (   |      _ _  ___ (___ (___  ___  ___| ___
// | |   )|   )     | | )|___)|    |   )|   )|   )|___
// | |__/ |__/      |  / |__  |__  |  / |__/ |__/  __/

    /**
     * @dev Get ICO phase status
     * @return Returns true if it is during ICO phase
     */
    function isICOPhase() public view returns (bool) {
        return game.startTime.add(game.periodSecsOfICOPhase) > now;
    }

    /**
     * @dev The core function to buy keys during ICO phase
     * @param _playerAddr Address of the player
     * @param _eth Funds
     * @param _aff Address of affiliate
     */
    function buyICOCore(address _playerAddr, uint256 _eth, address payable _aff) private {
        require(_playerAddr != _aff, "Affiliate and sender are identical!");
        require(game.active, "The game status is not active!");
        require(isICOPhase(), "Currently not in the ICO phase!");

        Player storage _player = game.players[msg.sender];
        _player.addr = _playerAddr;
        _player.ico = _player.ico.add(_eth);
        _player.eth = _player.eth.add(_eth);

        game.ico = game.ico.add(_eth);

        uint256 _jackpotEth = _eth.mul(30) / 100;
        uint256 _teamEth = _eth.mul(20) / 100;
        uint256 _dividendsEth = _eth.sub(_jackpotEth).sub(_teamEth);

        if (_player.aff == address(0) && _aff != address(0) && _aff != msg.sender) {
            Player storage _affPlayer = game.players[_aff];

            require(_affPlayer.addr != address(0), "Invalid affiliate address!");
            _player.aff = _aff;

            // Transferring affiliate commission.
            uint256 _affCommEth = _eth.mul(10) / 100;
            _aff.transfer(_affCommEth);

            // Adjust the payment for developer.
            _teamEth = _eth.mul(10) / 100;
        }

        game.teamEth = game.teamEth.add(_teamEth);
        game.dividendsEth = game.dividendsEth.add(_dividendsEth);

        totalTeamEth = totalTeamEth.add(_teamEth);

        // We need to deal with the jackpot here
        uint256 _jackpotRemainsEth = jackpotProc(game, _player, _jackpotEth);

        emit BuyOnICOPhase(msg.sender, _eth, _aff, game.teamEth, _jackpotRemainsEth, game.dividendsEth);
    }

    /**
     * @dev Buy keys during ICO phase
     * @param _aff Affiliate address, address(0) means no affiliate
     */
    function buyICO(address payable _aff) public payable {
        buyICOCore(msg.sender, msg.value, _aff);
    }

    /**
    * @dev Buy keys during ICO phase for manager
    * @param _playerAddr Address of the player
    * @param _eth Funds
    * @param _aff Address of affiliate
    */
    function buyICOByManager(address _playerAddr, uint256 _eth, address payable _aff) public isManager {
        buyICOCore(_playerAddr, _eth, _aff);
    }

//==/==|===============================/====/============|============================================================//
// (___| ___       ___       _ _  ___ (___ (___  ___  ___| ___
// |\   |___)\   )|___      | | )|___)|    |   )|   )|   )|___
// | \  |__   \_/  __/      |  / |__  |__  |  / |__/ |__/  __/
//             /

    /**
     * @dev Calculate the price of keys to be bought
     * @param _keys How many keys you want to buy
     * @return The total amount of eth are required
     */
    function calcEthForKeys(uint256 _keys) public view returns (uint256) {
        return game.keys.add(game.ico.keys()).add(_keys).ethRec(_keys);
    }

    /**
     * @dev Core function to buy keys
     * @param _playerAddr Address of the player
     * @param _eth Funds
     * @param _aff Address of the affiliate
     */
    function buyKeysCore(address _playerAddr, uint256 _eth, address payable _aff) private {
        require(game.active, "The game status is not active!");

        require(!isICOPhase(), "Cannot buy keys during ICO phase!");
        require(_playerAddr != _aff, "Affiliate and sender are identical!");

        uint256 _jackpotEth = _eth.mul(30) / 100;
        uint256 _teamEth = _eth.mul(20) / 100;
        uint256 _dividendsEth = _eth.sub(_jackpotEth).sub(_teamEth);

        Player storage _player = game.players[_playerAddr];
        if (_player.addr == address(0)) {
            // A new player is coming.
            _player.addr = msg.sender;

            if (_aff != address(0)) {
                _player.aff = _aff;

                // 10% for affiliate commission.
                uint256 _affCom = _eth.mul(10) / 100;
                _aff.transfer(_affCom);

                _teamEth = _affCom;
            }
        }

        // Player deduction update based on the keys.
        uint256 _keys = game.dividendsEth.keysRec(_eth);

        game.teamEth = game.teamEth.add(_teamEth);
        game.dividendsEth = game.dividendsEth.add(_dividendsEth);

        totalTeamEth = totalTeamEth.add(_teamEth);

        _player.eth = _player.eth.add(_eth);
        _player.deadEth = _player.deadEth.add(_keys.profit(game.profitPerKey));
        _player.keys = _player.keys.add(_keys);

        // New keys are mint.
        game.keys = game.keys.add(_keys);

        // Update game profit per key.
        uint256 _totalKeys = game.keys.add(game.ico.keys());
        uint256 _newProfitPerKey = _totalKeys.average(_dividendsEth);
        game.profitPerKey = game.profitPerKey.add(_newProfitPerKey);

        // We need to deal with the jackpot here
        jackpotProc(game, _player, _jackpotEth);

        emit KeysAreBought(msg.sender, _eth, _keys);
    }

    /**
     * @dev Buy keys by the eth amount
     * @param _aff Affiliate address
     */
    function buyKeys(address payable _aff) public payable {
        buyKeysCore(msg.sender, msg.value, _aff);
    }

    /**
    * @dev Buy keys by manager
    * @param _playerAddr Address of the player
    * @param _eth Funds
    * @param _aff Address of affiliate
    */
    function buyKeysByManager(address _playerAddr, uint256 _eth, address payable _aff) public isManager {
        buyKeysCore(_playerAddr, _eth, _aff);
    }

    /**
     * @dev Query key amount of a player
     * @param _playerAddr Address of the player
     * @return Amount value of keys
     */
    function queryKeys(address _playerAddr) public view returns (uint256) {
        Player storage _player = game.players[_playerAddr];
        return _player.keys;
    }

    /**
     * @dev Get the amount value are total bought by the player
     * @param _playerAddr Address of the player
     */
    function queryPlayerTotalEth(address _playerAddr) public view returns (uint256) {
        Player storage _player = game.players[_playerAddr];
        return _player.eth;
    }

    /**
     * @dev Calculate balance of a player
     * @param _playerAddr Address of the player
     * @return Amount can be withdrawn
     */
    function calcBalance(address _playerAddr) public view returns (uint256) {
        Player storage _player = game.players[_playerAddr];
        uint256 _icoKeys = 0;
        if (_player.ico > 0) {
            _icoKeys = _player.ico.keys();
        }
        uint256 _totalProfit = _player.keys.add(_icoKeys).profit(game.profitPerKey);
        uint256 _profit = _totalProfit.sub(_player.deadEth);
        return _profit;
    }

    /**
     * @dev Withdraw player amount
     * @param _eth How much you want to withdraw
     */
    function withdraw(uint256 _eth) public {
        address payable _playerAddr = msg.sender;
        Player storage _player = game.players[_playerAddr];
        require(_player.addr != address(0), "Invalid player address!");

        uint256 _balanceEth = calcBalance(_playerAddr);
        require(_balanceEth >= _eth, "Insufficient balance!");

        _playerAddr.transfer(_eth);
        _player.deadEth = _player.deadEth.add(_eth);

        emit WithdrawEvent(_playerAddr, _eth);
    }
}
