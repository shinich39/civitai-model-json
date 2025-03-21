export const wait = function (delay: number) {
  return new Promise<void>(function (resolve) {
    return setTimeout(resolve, delay);
  });
};
