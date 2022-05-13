/**
 * @param {number} chainId
 */
export const getUserFriendlyNameForChainId = (chainId) => {
    switch (chainId) {
        case 1:
            return 'Ethereum'
        case 5:
            return 'Görli Testnet'
        default:
            return ''
    }
}
