export const stringToASCIBytes = (string: string) => {
  const encoder = new TextEncoder();
  const byteArray = encoder.encode(string);
  return byteArray;
};
