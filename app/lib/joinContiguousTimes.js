function joinTimesDay(daySessions) {
  const fixedKeySessions = daySessions.reduce((o, session) => {
    /* eslint-disable no-param-reassign */
    if (o.prev && session.opens === o.prev.closes) {
      o.prev.closes = session.closes;
    } else {
      o.list.push(session);
      o.prev = session;
    }
    /* eslint-enable no-param-reassign */
    return o;
  }, { list: [], prev: undefined });

  return fixedKeySessions.list;
}

function joinTimes(type) {
  if (type) {
    Object.keys(type).forEach((key) => {
      // eslint-disable-next-line no-param-reassign
      type[key] = joinTimesDay(type[key]);
    });
  }
}

function joinContiguousTimes(pharmacy) {
  if (pharmacy.openingTimes) {
    joinTimes(pharmacy.openingTimes.general);
    joinTimes(pharmacy.openingTimes.alterations);
  }
}

module.exports = joinContiguousTimes;
