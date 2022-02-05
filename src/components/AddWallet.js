import React, { Fragment } from 'react';
import { addNewWallet, getWalletNames, isValidPassword } from '../utils/walletUtils';
import { INVALID_PASSWORD_LENGTH_MSG, INVALID_NAME_LENGTH_MSG }  from '../utils/walletUtils';
import { generateMnemonic, validateMnemonic } from 'bip39';
import { waitingAlert, displayMnemonic } from '../utils/Alerts';
import { SketchPicker } from 'react-color';
import ValidInput from './ValidInput';


export default class AddWallet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            walletName: '',
            isValidWalletName: false,
            invalidWalletMessage: INVALID_NAME_LENGTH_MSG,
            mnemonic: '',
            isValidMnemonic: false,
            password1: '',
            isValidPassword1: false,
            invalidPassword1Message: 'min 10 characters !',
            password2: '',
            isValidPassword2: false,
            invalidPassword2Message: 'min 10 characters !',
            color: "#8D8C8F",
            colorRgb: {
                r: 141, g: 140, b: 143
            }
        };
        this.setWalletName = this.setWalletName.bind(this);
        this.setMnemonic = this.setMnemonic.bind(this);
        this.setPassword1 = this.setPassword1.bind(this);
        this.setPassword2 = this.setPassword2.bind(this);
        this.saveWallet = this.saveWallet.bind(this);
        this.generateMnemonic = this.generateMnemonic.bind(this);
    }

    setWalletName = (name) => {
        const minWalletNameChar = 2;
        const walletNameAlreadyExists = getWalletNames().includes(name);
        var invalidMessage = ' ';
        if (name.length <= minWalletNameChar) { invalidMessage += INVALID_NAME_LENGTH_MSG };
        if (walletNameAlreadyExists) invalidMessage += " Wallet name already exists !";
        const validWalletName = (name.length > minWalletNameChar) && !walletNameAlreadyExists;
        this.setState({
            walletName: name,
            isValidWalletName: validWalletName,
            invalidWalletMessage: invalidMessage,
        });
    };
    setMnemonic = (mnemonic) => {
        this.setState({
            mnemonic: mnemonic,
            isValidMnemonic: validateMnemonic(mnemonic),
        });
    };
    setPassword1 = (password) => {
        const isValid = isValidPassword(password);
        var validPasswordMessage = ''
        if (!isValid) {validPasswordMessage += INVALID_PASSWORD_LENGTH_MSG;}
        this.setState({
            password1: password,
            isValidPassword1: isValidPassword(password),
            invalidPassword1Message: validPasswordMessage,
        });
        this.setPassword2(this.state.password2);
    };
    setPassword2 = (password) => {
        const isValid = isValidPassword(password);
        var validPasswordMessage = ''
        if (!isValid) {validPasswordMessage += INVALID_PASSWORD_LENGTH_MSG;}
        if (this.state.password1 !== password) {validPasswordMessage += " Password does not match !";};
        this.setState((prevState) => ({
            password2: password, 
            isValidPassword2: (isValidPassword(password) && prevState.password1 === password),
            invalidPassword2Message: validPasswordMessage,
        }));
    };

    saveWallet = () => {
        var swal = waitingAlert("Searching existing addresses...");
        addNewWallet(this.state.walletName, this.state.mnemonic, this.state.password1, this.state.color, this.state.colorRgb).then((numWal) => {
            console.log("saveWallet", this.state.mnemonic)
            swal = displayMnemonic(this.state.mnemonic).then(res => {
                this.props.setPage('home');
            });
        });
    }

    generateMnemonic = (bytesLength) => {
        const mnemonic = generateMnemonic(bytesLength);
        this.setMnemonic(mnemonic);
    }

    onChangeColor = (color) => {
        this.setState({
            color: color.hex,
            colorRgb: color.rgb
        });
    };

    render() {
        console.log("this.state.invalidWalletMessage", this.state.invalidWalletMessage)
        return (
            <Fragment>
                <div className='container card m-1 p-1 d-flex flex-column w-75' style={{ borderColor: this.state.color, backgroundColor: `rgba(${this.state.colorRgb.r},${this.state.colorRgb.g},${this.state.colorRgb.b},0.25)` }}>
                    <h4>Create or restore an Ergo wallet</h4>
                    <div className='d-flex flex-column m-1'>
                        <div className='d-flex flex-column'>
                            <label htmlFor="walletName" >Wallet name</label>
                            <div className='d-flex flex-row align-items-center col-sm-4'>
                                <input type="text"
                                    id="walletName"
                                    className="form-control"
                                    onChange={e => this.setWalletName(e.target.value)}
                                    value={this.state.walletName}
                                    className={this.state.isValidWalletName ? "validInput m-1" : "invalidInput m-1"}
                                />
                                <ValidInput id="isValidWalletName" isValid={this.state.isValidWalletName} validMessage="OK" invalidMessage={this.state.invalidWalletMessage} />
                            </div>

                            <label htmlFor="walletColor" style={{ color: this.state.color }}>Wallet color</label>
                            <div className='d-flex flex-row align-items-center col-sm-4'>
                                <div >
                                    <SketchPicker id="color" color={this.state.color} onChange={this.onChangeColor} />
                                </div>
                            </div>
                        </div>
                        <br />
                        <div className='d-flex flex-column'>
                            <label htmlFor="mnemonic" >Mnemonic</label>
                            <div className='d-flex flex-row'>
                                <div className='d-flex flex-column col-sm'>
                                    <textarea
                                        id="mnemonic"
                                        rows="3"
                                        onChange={e => this.setMnemonic(e.target.value)}
                                        value={this.state.mnemonic}
                                        className={this.state.isValidMnemonic ? "validInput m-1 " : "invalidInput m-1"}
                                    />
                                </div>
                                <ValidInput id="isValidMnemonic" isValid={this.state.isValidMnemonic} validMessage="OK" invalidMessage="Invalid mnemonic (BIP-39)" />
                            </div>
                        </div>
                        <div className='d-flex flex-row align-items-center'>
                            <div>Get random mnemonic</div>&nbsp;
                            <button className="btn btn-outline-info" onClick={() => this.generateMnemonic(128)}>12 words</button>&nbsp;
                            <button className="btn btn-outline-info" onClick={() => this.generateMnemonic(160)}>15 words</button>&nbsp;
                            <button className="btn btn-outline-info" onClick={() => this.generateMnemonic(192)}>18 words</button>&nbsp;
                            <button className="btn btn-outline-info" onClick={() => this.generateMnemonic(224)}>21 words</button>&nbsp;
                            <button className="btn btn-outline-info" onClick={() => this.generateMnemonic(256)}>24 words</button>&nbsp;
                        </div>
                        <br />
                        <div className='d-flex flex-column'>
                            <label htmlFor="password1" >Spending password</label>
                            <div className='d-flex flex-column col-sm-4'>
                                <div className='d-flex flex-row align-items-center'>
                                    <input type="password"
                                        id="password1"
                                        className="form-control "
                                        onChange={e => this.setPassword1(e.target.value)}
                                        value={this.state.password1}
                                        className={this.state.isValidPassword1 ? "validInput m-1" : "invalidInput m-1"}
                                    />
                                    <ValidInput id="isValidPassword1" isValid={this.state.isValidPassword1} validMessage="OK" invalidMessage={this.state.invalidPassword1Message} />
                                </div>
                                <div className='d-flex flex-row align-items-center'>
                                <input type="password"
                                    id="password2"
                                    className="form-control "
                                    onChange={e => this.setPassword2(e.target.value)}
                                    value={this.state.password2}
                                    className={this.state.isValidPassword2 ? "validInput m-1" : "invalidInput m-1"}
                                />
                                <ValidInput id="isValidPassword2" isValid={this.state.isValidPassword2} validMessage="OK" invalidMessage={this.state.invalidPassword2Message} />
                                </div>
                            </div>
                        </div>
                        <div className='d-flex flex-row justify-content-center'>
                            <button className="btn btn-outline-info" onClick={this.saveWallet}
                                disabled={!(this.state.isValidWalletName && this.state.isValidMnemonic && this.state.isValidPassword1 && this.state.isValidPassword2)}>
                                Add wallet
                            </button>
                        </div>
                    </div>
                </div>
            </Fragment>
        )
    }
}