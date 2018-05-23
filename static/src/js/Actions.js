import dispatcher from "./Dispatcher";

export function runNugget(data) {
  dispatcher.publish({
    event: 'RUN',
    data
  });
}

export function receiveNugget(data) {
  dispatcher.publish({
    event: 'RECEIVE',
    data
  });
}
