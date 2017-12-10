const {BufferReader, BufferWriter} = require('qtumscan-lib').encoding

class Encoding {
  constructor(servicePrefix) {
    this._servicePrefix = servicePrefix
    this._addressPrefix = Buffer.from('00', 'hex')
    this._utxoPrefix = Buffer.from('01', 'hex')
    this._balancePrefix = Buffer.from('02', 'hex')
  }

  encodeAddressIndexKey(address, height, txid, index, input, timestamp) {
    let writer = new BufferWriter()
    writer.write(this._servicePrefix)
    writer.write(this._addressPrefix)
    writer.writeUInt8(address.length)
    writer.write(Buffer.from(address))
    writer.writeUInt32BE(height || 0)
    writer.writeHexString(txid || '0'.repeat(64))
    writer.writeUInt32BE(index || 0)
    writer.writeUInt8(input || 0)
    writer.writeUInt32BE(timestamp || 0)
    return writer.toBuffer()
  }

  decodeAddressIndexKey(buffer) {
    let reader = new BufferReader(buffer)
    reader.set({pos: 3})
    let addressSize = reader.readUInt8()
    let address = reader.read(addressSize).toString()
    let height = reader.readUInt32BE()
    let txid = reader.readHexString(32)
    let index = reader.readUInt32BE()
    let input = reader.readUInt8()
    let timestamp = reader.readUInt32BE()
    return {address, height, txid, index, input, timestamp}
  }

  encodeUtxoIndexKey(address, txid, outputIndex) {
    let writer = new BufferWriter()
    writer.write(this._servicePrefix)
    writer.write(this._utxoPrefix)
    writer.writeUInt8(address.length)
    writer.write(Buffer.from(address))
    writer.writeHexString(txid || '0'.repeat(64))
    writer.writeUInt32BE(outputIndex || 0)
    return writer.toBuffer()
  }

  decodeUtxoIndexKey(buffer) {
    let reader = new BufferReader(buffer)
    reader.set({pos: 3})
    let addressSize = reader.readUInt8()
    let address = reader.read(addressSize).toString()
    let txid = reader.readHexString(32)
    let outputIndex = reader.readUInt32BE()
    return {address, txid, outputIndex}
  }

  encodeUtxoIndexValue(height, satoshis, timestamp, scriptBuffer) {
    let writer = new BufferWriter()
    writer.writeUInt32BE(height)
    writer.writeDoubleBE(satoshis)
    writer.writeUInt32BE(timestamp)
    writer.write(scriptBuffer)
    return writer.toBuffer()
  }

  decodeUtxoIndexValue(buffer) {
    let reader = new BufferReader(buffer)
    let height = reader.readUInt32BE()
    let satoshis = reader.readDoubleBE()
    let timestamp = reader.readUInt32BE()
    let scriptBuffer = reader.readAll()
    return {height, satoshis, timestamp, scriptBuffer}
  }

  encodeAddressBalanceKey(address) {
    let writer = new BufferWriter()
    writer.write(this._servicePrefix)
    writer.write(this._balancePrefix)
    writer.writeUInt8(address.length)
    writer.write(Buffer.from(address))
    return writer.toBuffer()
  }

  decodeAddressBalanceKey(buffer) {
    let addressLength = buffer.readUInt8(3)
    return buffer.slice(4).toString()
  }

  encodeAddressBalanceValue({
    balance,
    totalReceived, totalSent,
    unconfirmedBalance,
    txAppearances, unconfirmedTxAppearances
  }) {
    let writer = new BufferWriter()
    writer.writeVarintBN(balance)
    writer.writeVarintBN(totalReceived)
    writer.writeVarintBN(totalSent)
    writer.writeVarintBN(unconfirmedBalance)
    writer.writeUInt32BE(txAppearances)
    writer.writeUInt32BE(unconfirmedTxAppearances)
    return writer.toBuffer()
  }

  decodeAddressBalanceValue(buffer) {
    let reader = new BufferReader(buffer)
    let balance = reader.readVarintBN()
    let totalReceived = reader.readVarintBN()
    let totalSent = reader.readVarintBN()
    let unconfirmedBalance = reader.readVarintBN()
    let txAppearances = reader.readUInt32BE()
    let unconfirmedTxAppearances = reader.readUInt32BE()
    return {balance, totalReceived, totalSent, unconfirmedBalance, txAppearances, unconfirmedTxAppearances}
  }
}

module.exports = Encoding
