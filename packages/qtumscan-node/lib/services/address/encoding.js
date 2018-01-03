const {BufferReader, BufferWriter} = require('qtumscan-lib').encoding

class Encoding {
  constructor(servicePrefix) {
    this._servicePrefix = servicePrefix
    this._addressPrefix = Buffer.from('00', 'hex')
    this._utxoPrefix = Buffer.from('01', 'hex')
    this._usedUtxoPrefix = Buffer.from('02', 'hex')
  }

  encodeAddressIndexKey(address, height, txid, index, input, timestamp) {
    let writer = new BufferWriter()
    writer.write(this._servicePrefix)
    writer.write(this._addressPrefix)
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
    let address = reader.read(34).toString()
    let height = reader.readUInt32BE()
    let txid = reader.readHexString(32)
    let index = reader.readUInt32BE()
    let input = reader.readUInt8()
    let timestamp = reader.readUInt32BE()
    return {address, height, txid, index, input, timestamp}
  }

  encodeUtxoIndexKey(address, txid = '0'.repeat(64), outputIndex = 0) {
    let writer = new BufferWriter()
    writer.write(this._servicePrefix)
    writer.write(this._utxoPrefix)
    writer.write(Buffer.from(address))
    if (Buffer.isBuffer(txid)) {
      writer.write(txid)
    } else {
      writer.writeHexString(txid)
    }
    writer.writeUInt32BE(outputIndex)
    return writer.toBuffer()
  }

  decodeUtxoIndexKey(buffer) {
    let reader = new BufferReader(buffer)
    reader.set({pos: 3})
    let address = reader.read(34).toString()
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

  encodeUsedUtxoIndexKey(address, txid = '0'.repeat(64), outputIndex = 0) {
    let writer = new BufferWriter()
    writer.write(this._servicePrefix)
    writer.write(this._usedUtxoPrefix)
    writer.write(Buffer.from(address))
    if (Buffer.isBuffer(txid)) {
      writer.write(txid)
    } else {
      writer.writeHexString(txid)
    }
    writer.writeUInt32BE(outputIndex)
    return writer.toBuffer()
  }

  decodeUsedUtxoIndexKey(buffer) {
    let reader = new BufferReader(buffer)
    reader.set({pos: 3})
    let address = reader.read(34).toString()
    let txid = reader.readHexString(32)
    let outputIndex = reader.readUInt32BE()
    return {address, txid, outputIndex}
  }

  encodeUsedUtxoIndexValue(height, satoshis, timestamp, outputTxid, spentHeight, scriptBuffer) {
    let writer = new BufferWriter()
    writer.writeUInt32BE(height)
    writer.writeDoubleBE(satoshis)
    writer.writeUInt32BE(timestamp)
    writer.writeHexString(outputTxid)
    writer.writeUInt32BE(spentHeight)
    writer.write(scriptBuffer)
    return writer.toBuffer()
  }

  decodeUsedUtxoIndexValue(buffer) {
    let reader = new BufferReader(buffer)
    let height = reader.readUInt32BE()
    let satoshis = reader.readDoubleBE()
    let timestamp = reader.readUInt32BE()
    let outputTxid = reader.readHexString(32)
    let spentHeight = reader.readUInt32BE()
    let scriptBuffer = reader.readAll()
    return {height, satoshis, timestamp, outputTxid, spentHeight, scriptBuffer}
  }
}

module.exports = Encoding
