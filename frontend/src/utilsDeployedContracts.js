import {includes, map} from "lodash";

export const DEPLOYED_CONTRACTS = [
    {
        chainId: 5,
        name: 'Görli Testnet',
        contractAddress: '0xAb3160358410B2912f319C2Ec61a6d88bF138520',
    },
]

export function isSupportedNetwork (chainId) {
    return includes(map(DEPLOYED_CONTRACTS, 'chainId'), chainId);
}
