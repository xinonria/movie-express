const bigintProto = BigInt.prototype as unknown as { toJSON?: () => string };

if (typeof bigintProto.toJSON !== 'function') {
  Object.defineProperty(bigintProto, 'toJSON', {
    value(this: bigint) {
      return this.toString();
    },
    configurable: true,
  });
}

export {};
