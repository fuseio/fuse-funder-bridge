const tokens = [
    {
        name: 'USDC',
        address: '0x28c3d1cd466ba22f6cae51b1a4692a831696391a',
        decimals: 6,
        min_amount: 9,
    },
    {
        name: 'USDT',
        address: '0x68c9736781e9316ebf5c3d49fe0c1f45d2d104cd',
        decimals: 6,
        min_amount: 9,
    },
    {
        name: 'WETH',
        address: '0x5622f6dc93e08a8b717b149677930c38d5d50682',
        decimals: 18,
        min_amount: 0.002,
    },
]

export const getDecimals = (token: string) => {
    const tokenInfo = tokens.find(t => t.address.toLowerCase() === token)
    return tokenInfo?.decimals
}

export const getMinAmount = (token: string) => {
    const tokenInfo = tokens.find(t => t.address.toLowerCase() === token)
    return tokenInfo?.min_amount
}