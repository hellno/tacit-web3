import {Fragment, useEffect, useState} from 'react'
import {Menu, Popover, Transition} from '@headlessui/react'
import {MenuIcon, XIcon} from '@heroicons/react/outline'
import {ChevronDownIcon, ChevronRightIcon} from '@heroicons/react/solid'
import Web3Modal from "web3modal";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnect from "@walletconnect/web3-provider";
import {ethers} from "ethers";
import {includes, isEmpty, map, startCase, truncate} from "lodash";
import {toHex} from "web3-utils";
import {useForm} from 'react-hook-form';
import {getUserFriendlyNameForChainId} from "../src/utils";
import abi from "../src/abi/TaskPortal.json";

const contractABI = abi.abi;
const contractAddress = '0xAb3160358410B2912f319C2Ec61a6d88bF138520';

export const classNames = (...classes: any[]) => {
    return classes.filter(Boolean)
        .join(' ');
};

export const providerOptions = {
    coinbasewallet: {
        package: CoinbaseWalletSDK,
        options: {
            appName: "Web 3 Modal Demo",
            infuraId: process.env.INFURA_KEY
        }
    },
    walletconnect: {
        package: WalletConnect,
        options: {
            infuraId: process.env.INFURA_KEY
        }
    }
};

const navigation: any[] = [
    // {name: 'Product', href: '#'},
    // {name: 'Features', href: '#'},
    // {name: 'Marketplace', href: '#'},
    // {name: 'Company', href: '#'},
]

enum TaskSubmissionState {
    WaitForSending,
    StartedSending,
    WaitingForUserAccept,
    Success,
    UserRejected,
}

export default function Home() {
    const [web3Modal, setWeb3Modal] = useState();
    const [provider, setProvider] = useState();
    const [library, setLibrary] = useState();
    const [account, setAccount] = useState();
    const [network, setNetwork] = useState();
    const [taskSubmissionState, setTaskSubmissionState] = useState<TaskSubmissionState>(TaskSubmissionState.WaitForSending);

    const {
        register,
        handleSubmit
    } = useForm();

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on("chainChanged", () => {
                window.location.reload();
            });
            window.ethereum.on("accountsChanged", () => {
                window.location.reload();
            });
        }
    });

    // @ts-ignore
    const connectWallet = async (web3Modal) => {
        try {
            // @ts-ignore
            const newProvider = await web3Modal.connect();
            const newLibrary = new ethers.providers.Web3Provider(newProvider);
            const newAccounts = await newLibrary.listAccounts();
            const newNetwork = await newLibrary.getNetwork();

            setProvider(newProvider);
            // @ts-ignore
            setLibrary(newLibrary);
            // @ts-ignore
            if (newAccounts) setAccount(newAccounts[0]);
            // @ts-ignore
            setNetwork(newNetwork);
        } catch (error) {
            // @ts-ignore
            switch (error.code) {
                case -32602:
                    setTaskSubmissionState(TaskSubmissionState.UserRejected)
                    break;
                default:
                    break;
            }
            console.error(error);
        }
    };

    const isWalletConnected = !isEmpty(account);

    const handleFormSubmit = (formData: { taskTitle: string, description: string, email: string, bountyAmount: bigint, bountyCurrency: string }) => {
        if (isWalletConnected) {
            console.log()
            addTask({
                title: formData.taskTitle,
                description: formData.description,
                bountyAmount: formData.bountyAmount,
                bountyCurrency: formData.bountyCurrency
            })
        } else {
            connectWallet(web3Modal)
        }
    };

    const renderChainSwitcher = () => {
        if (isEmpty(process.env.DEPLOYED_CONTRACTS) || isEmpty(network)) {
            return
        }
        const deployedContracts = process.env.DEPLOYED_CONTRACTS
        // @ts-ignore
        const chains = deployedContracts.filter((chain) => chain.chainId !== network.chainId);
        // @ts-ignore
        const isSupportedNetwork = includes(map(deployedContracts, 'chainId'), network.chainId);

        // @ts-ignore
        const currentChainName = startCase(getUserFriendlyNameForChainId(network.chainId) || network.name);

        // @ts-ignore
        return (<Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button
                    className="inline-flex justify-center w-full rounded-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
                    Select Chain
                    <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true"/>
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items
                    className="origin-top-right absolute right-0 mt-2 w-full rounded-sm shadow-md bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        <Menu.Item>
                            <span className="w-full text-left text-gray-700 block px-4 py-2 text-sm">
                                {currentChainName}{" "}
                                {isSupportedNetwork ? "✅" : "(Unsupported)"}
                            </span>
                        </Menu.Item>
                        {map(chains, (chain: { chainId: number, name: string, }) => {
                            console.log(chain.name)
                            return (<Menu.Item>
                                    {({active}) => (
                                        <button
                                            onClick={() => switchNetwork(chain.chainId)}
                                            className={classNames(
                                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                'w-full text-left block px-4 py-2 text-sm'
                                            )}
                                        >
                                            {getUserFriendlyNameForChainId(chain.chainId) || chain.name}
                                        </button>
                                    )}
                                </Menu.Item>
                            )
                        })}
                        <Menu.Item>
                            {({active}) => (
                                <button
                                    onClick={disconnectWallet}
                                    className={classNames(
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                        'w-full text-left block px-4 py-2 text-sm'
                                    )}
                                >
                                    Disconnect
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>)
    }

    const addTask = async ({
                               title,
                               description,
                               bountyAmount,
                               bountyCurrency
                           }: { title: string, description: string, bountyAmount: bigint, bountyCurrency: string }) => {
        try {
            if (library) {
                // @ts-ignore
                const signer = library.getSigner();
                const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

                let count = await wavePortalContract.getTotalWaves();
                console.log("Retrieved total wave count...", count.toNumber());

                const waveTxn = await wavePortalContract.addTask(title, description);
                console.log("Mining...", waveTxn.hash);

                await waveTxn.wait();
                console.log("Mined -- ", waveTxn.hash);

                count = await wavePortalContract.getTotalWaves();
                console.log("Retrieved total wave count...", count.toNumber());
            } else {
                console.log("Ethereum provider object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    }


    const switchNetwork = async (chainId: number) => {
        try {
            // @ts-ignore
            await library.provider.request({
                method: "wallet_switchEthereumChain",
                params: [{chainId: toHex(chainId)}],
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            // @ts-ignore
            if (switchError.code === 4902) {
                try {
                    // @ts-ignore
                    await library.provider.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainId: toHex(137),
                                chainName: "Polygon",
                                rpcUrls: ["https://polygon-rpc.com/"],
                                blockExplorerUrls: ["https://polygonscan.com/"],
                            },
                        ],
                    });
                } catch (addError) {
                    throw addError;
                }
            }
        }
    };

    const disconnectWallet = () => {
        // @ts-ignore
        setAccount(null);
        // @ts-ignore
        setProvider(null);
    }

    useEffect(() => {
        const web3ModalTemp = new Web3Modal({
            network: "mainnet", // optional
            cacheProvider: true, // optional
            providerOptions // required
        });
        // @ts-ignore
        setWeb3Modal(web3ModalTemp)

        if (web3ModalTemp.cachedProvider) {
            connectWallet(web3ModalTemp)
        }
    }, []);

    const renderWalletConnectComponent = () => {
        return <div className="">
            {isWalletConnected ?
                (<span
                    className="inline-flex items-center px-4 py-2 shadow-sm shadow-gray-600 text-sm font-medium rounded-sm text-white bg-yellow-400">
                Wallet Address: {truncate(account, {'length': 10})}
            </span>) :
                (<button
                    onClick={() => connectWallet(web3Modal)}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none">
                    Connect Wallet
                </button>)
            }
        </div>
    }


    const renderFormField = ({
                                 name,
                                 type,
                                 value = undefined,
                                 required = false
                             }: { name: string; type: string, value?: string, required?: boolean }) => {
        return (<div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                {startCase(name)}
            </label>
            <input
                {...register(name)}
                type={type}
                name={name}
                id={name}
                autoComplete={name}
                placeholder={startCase(name)}
                value={value}
                required={required}
                className={classNames("text-gray-900",
                    "mt-1 block w-full shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-gray-300 rounded-sm"
                )}
            />
        </div>)
    }

    const renderAmountAndCurrencyFormfield = () => {
        return <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <input
                    type="text"
                    name="price"
                    id="price"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-sm"
                    placeholder="0.00001"
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                    <label htmlFor="currency" className="sr-only">
                        Currency
                    </label>
                    <select
                        id="currency"
                        name="currency"
                        className="focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-sm"
                    >
                        <option>ETH</option>
                        <option>DAI</option>
                        <option>OHM</option>
                    </select>
                </div>
            </div>
        </div>
    }

    // @ts-ignore
    const onFormSubmit = handleSubmit(handleFormSubmit)

    // @ts-ignore
    return (
        <div
            // className="relative bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 overflow-hidden min-h-screen">
            className="relative bg-gradient-to-tr from-red-500 via-gray-700 to-gray-800 overflow-hidden min-h-screen">
            <div className="relative pt-6 pb-16 sm:pb-24">
                <Popover>
                    <nav
                        className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6"
                        aria-label="Global"
                    >
                        <div className="flex items-center flex-1">
                            <div className="flex items-center justify-between w-full md:w-auto">
                                <a href="#">
                                    <span className="sr-only">Tacit</span>
                                    <img
                                        className="h-8 w-auto sm:h-10"
                                        src="./tacit_t.png"
                                        alt=""
                                    />
                                </a>
                                <div className="-mr-2 flex items-center md:hidden">
                                    <Popover.Button
                                        className="bg-gray-800 rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:bg-gray-700 focus:outline-none focus:ring-2 focus-ring-inset focus:ring-white">
                                        <span className="sr-only">Open main menu</span>
                                        <MenuIcon className="h-6 w-6" aria-hidden="true"/>
                                    </Popover.Button>
                                </div>
                            </div>
                            <div className="hidden space-x-10 md:flex md:ml-10">
                                {navigation.map((item) => (
                                    <a key={item.name} href={item.href}
                                       className="font-medium text-white hover:text-gray-300">
                                        {item.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                        <div className="hidden md:flex">
                            {renderWalletConnectComponent()}
                            <div className="ml-2">
                                {/*{isWalletConnected && renderChainSwitcher()}*/}
                                {renderChainSwitcher()}
                            </div>
                        </div>
                    </nav>

                    <Transition
                        as={Fragment}
                        enter="duration-150 ease-out"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="duration-100 ease-in"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Popover.Panel
                            focus
                            className="absolute z-10 top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden"
                        >
                            <div
                                className="rounded-lg shadow-md bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
                                <div className="px-5 py-2 flex items-center justify-between">
                                    <div
                                        className="block w-full py-3"
                                    >
                                        {renderWalletConnectComponent()}
                                    </div>
                                    <div className="-mr-2">
                                        <Popover.Button
                                            className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:bg-gray-100 focus:outline-none">
                                            <span className="sr-only">Close menu</span>
                                            <XIcon className="h-6 w-6" aria-hidden="true"/>
                                        </Popover.Button>
                                    </div>
                                </div>
                                {/*<div className="px-2 pt-2 pb-3 space-y-1">*/}
                                {/*    {navigation.map((item) => (*/}
                                {/*        <a*/}
                                {/*            key={item.name}*/}
                                {/*            href={item.href}*/}
                                {/*            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"*/}
                                {/*        >*/}
                                {/*            {item.name}*/}
                                {/*        </a>*/}
                                {/*    ))}*/}
                                {/*</div>*/}

                            </div>
                        </Popover.Panel>
                    </Transition>
                </Popover>

                <main className="mt-16 sm:mt-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                            <div
                                className="px-4 sm:px-6 sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
                                <div>
                                    <a
                                        href="#"
                                        className="inline-flex items-center text-white bg-gray-900 rounded-full p-1 pr-2 sm:text-base lg:text-sm xl:text-base hover:text-gray-200"
                                    >
                    <span
                        className="px-3 py-0.5 text-white text-xs font-semibold leading-5 uppercase tracking-wide bg-yellow-500 rounded-full">
                      WAGMI
                    </span>
                                        <span className="ml-4 text-sm">Thanks for being here</span>
                                        <ChevronRightIcon className="ml-2 w-5 h-5 text-gray-500"
                                                          aria-hidden="true"/>
                                    </a>
                                    <h1 className="mt-4 text-4xl tracking-tight font-extrabold text-white sm:mt-5 sm:leading-none lg:mt-6 lg:text-5xl xl:text-6xl">
                                        <span className="md:block">Crowd search tasks</span>{' '}
                                        <span className="text-yellow-400 md:block">for service DAOs</span>
                                    </h1>
                                    <p className="mt-3 text-base text-gray-100 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                                        Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem
                                        cupidatat
                                        commodo. Elit sunt
                                        amet fugiat veniam occaecat fugiat aliqua ad ad non deserunt sunt.
                                    </p>
                                    <p className="mt-8 text-sm text-white uppercase tracking-wide font-semibold sm:mt-10">Used
                                        by</p>
                                    <div className="mt-5 w-full sm:mx-auto sm:max-w-lg lg:ml-0">
                                        <div className="flex flex-wrap items-start justify-between">
                                            <div className="flex justify-center px-1">
                                                <img
                                                    className="h-9 sm:h-10"
                                                    src="https://tailwindui.com/img/logos/tuple-logo-gray-400.svg"
                                                    alt="Tuple"
                                                />
                                            </div>
                                            <div className="flex justify-center px-1">
                                                <img
                                                    className="h-9 sm:h-10 invert"
                                                    src="./arweave.png"
                                                    alt="Workcation"
                                                />
                                            </div>
                                            <div className="flex justify-center px-1">
                                                <img
                                                    className="h-9 sm:h-10"
                                                    src="https://tailwindui.com/img/logos/statickit-logo-gray-400.svg"
                                                    alt="StaticKit"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-16 sm:mt-24 lg:mt-0 lg:col-span-6">
                                <div
                                    className="bg-white sm:max-w-md sm:w-full sm:mx-auto sm:rounded-sm sm:overflow-hidden">
                                    <div className="px-4 py-8 sm:px-10">
                                        <div className="mt-6">
                                            <form onSubmit={onFormSubmit} className="space-y-6">
                                                <div>
                                                    <label htmlFor="walletAddress"
                                                           className="block text-sm font-medium text-gray-700">
                                                        Wallet Address
                                                    </label>
                                                    {isWalletConnected ? (
                                                        <input
                                                            type="text"
                                                            name="walletAddress"
                                                            id="walletAddress"
                                                            placeholder="Wallet Address"
                                                            value={account}
                                                            disabled={true}
                                                            className="select-none text-gray-600 mt-1 block w-full shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-gray-300 rounded-sm"
                                                        />
                                                    ) : <div className="mt-1">{renderWalletConnectComponent()}</div>}
                                                </div>
                                                {renderFormField({name: "email", type: "email", required: true})}
                                                {renderFormField({name: "taskTitle", type: "text", required: true})}
                                                {renderAmountAndCurrencyFormfield()}
                                                <div className="">
                                                    <label htmlFor="about"
                                                           className="block text-sm font-medium text-gray-700">
                                                        Task Description
                                                    </label>
                                                    <div className="mt-1">
                                                    <textarea
                                                        {...register("description")}
                                                        id="description"
                                                        name="description"
                                                        required
                                                        rows={3}
                                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-sm"
                                                        defaultValue={''}
                                                    />
                                                    </div>
                                                    <p className="mt-2 text-sm text-gray-500">Write a few sentences
                                                        about the task and how others can fulfill it.</p>
                                                </div>
                                                <div>
                                                    <button
                                                        type="submit"
                                                        disabled={!isWalletConnected}
                                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none"
                                                    >
                                                        Submit Task
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                    <div className="px-4 py-6 bg-gray-50 border-t-2 border-gray-200 sm:px-10">
                                        <p className="text-xs leading-5 text-gray-500">
                                            By signing up, you agree to be{' '}
                                            <a href="#" className="font-medium text-gray-900 hover:underline">
                                                kind
                                            </a>
                                            {' '}and{' '}
                                            <a href="#" className="font-medium text-gray-900 hover:underline">
                                                extra chill
                                            </a>
                                            .
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

