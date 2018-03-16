const chai = require('chai');

const joinContiguousTimes = require('../../app/lib/joinContiguousTimes');

const expect = chai.expect;

describe('joinContiguousTimes', () => {
  it('should replace multiple contiguous open and closing times with single first opens and last closes time for general and alterations', () => {
    const pharmacy = {
      openingTimes: {
        general: {
          monday: [
            {
              opens: '09:00',
              closes: '13:00',
            },
            {
              opens: '13:00',
              closes: '17:00',
            },
            {
              opens: '17:00',
              closes: '19:30',
            },
          ],
          tuesday: [
            {
              opens: '09:01',
              closes: '13:00',
            },
            {
              opens: '13:00',
              closes: '17:00',
            },
            {
              opens: '17:00',
              closes: '19:31',
            },
          ],
          wednesday: [
            {
              opens: '09:02',
              closes: '13:00',
            },
            {
              opens: '13:00',
              closes: '17:00',
            },
            {
              opens: '17:00',
              closes: '19:32',
            },
          ],
          thursday: [
            {
              opens: '09:03',
              closes: '13:00',
            },
            {
              opens: '13:00',
              closes: '17:00',
            },
            {
              opens: '17:00',
              closes: '19:33',
            },
          ],
          friday: [
            {
              opens: '09:04',
              closes: '13:00',
            },
            {
              opens: '13:00',
              closes: '17:00',
            },
            {
              opens: '17:00',
              closes: '19:34',
            },
          ],
          saturday: [
            {
              opens: '09:05',
              closes: '13:00',
            },
            {
              opens: '13:00',
              closes: '17:00',
            },
            {
              opens: '17:00',
              closes: '19:35',
            },
          ],
          sunday: [
            {
              opens: '09:06',
              closes: '13:00',
            },
            {
              opens: '13:00',
              closes: '17:00',
            },
            {
              opens: '17:00',
              closes: '19:36',
            },
          ],
        },
        alterations: {
          '2018-01-01': [
            {
              opens: '09:07',
              closes: '13:00',
            },
            {
              opens: '13:00',
              closes: '17:00',
            },
            {
              opens: '17:00',
              closes: '19:37',
            },
          ],
        },
      },
    };

    joinContiguousTimes(pharmacy);
    expect(pharmacy.openingTimes.general.monday.length).to.equal(1);
    expect(pharmacy.openingTimes.general.monday[0].opens).to.equal('09:00');
    expect(pharmacy.openingTimes.general.monday[0].closes).to.equal('19:30');
    expect(pharmacy.openingTimes.general.tuesday.length).to.equal(1);
    expect(pharmacy.openingTimes.general.tuesday[0].opens).to.equal('09:01');
    expect(pharmacy.openingTimes.general.tuesday[0].closes).to.equal('19:31');
    expect(pharmacy.openingTimes.general.wednesday.length).to.equal(1);
    expect(pharmacy.openingTimes.general.wednesday[0].opens).to.equal('09:02');
    expect(pharmacy.openingTimes.general.wednesday[0].closes).to.equal('19:32');
    expect(pharmacy.openingTimes.general.thursday.length).to.equal(1);
    expect(pharmacy.openingTimes.general.thursday[0].opens).to.equal('09:03');
    expect(pharmacy.openingTimes.general.thursday[0].closes).to.equal('19:33');
    expect(pharmacy.openingTimes.general.friday.length).to.equal(1);
    expect(pharmacy.openingTimes.general.friday[0].opens).to.equal('09:04');
    expect(pharmacy.openingTimes.general.friday[0].closes).to.equal('19:34');
    expect(pharmacy.openingTimes.general.saturday.length).to.equal(1);
    expect(pharmacy.openingTimes.general.saturday[0].opens).to.equal('09:05');
    expect(pharmacy.openingTimes.general.saturday[0].closes).to.equal('19:35');
    expect(pharmacy.openingTimes.general.sunday.length).to.equal(1);
    expect(pharmacy.openingTimes.general.sunday[0].opens).to.equal('09:06');
    expect(pharmacy.openingTimes.general.sunday[0].closes).to.equal('19:36');
    expect(pharmacy.openingTimes.alterations['2018-01-01'].length).to.equal(1);
    expect(pharmacy.openingTimes.alterations['2018-01-01'][0].opens).to.equal('09:07');
    expect(pharmacy.openingTimes.alterations['2018-01-01'][0].closes).to.equal('19:37');
  });

  it('should leave non-contiguous sessions unaltered', () => {
    const pharmacy = {
      openingTimes: {
        general: {
          monday: [
            {
              opens: '09:00',
              closes: '13:00',
            },
            {
              opens: '14:00',
              closes: '17:00',
            },
          ],
        },
      },
    };

    joinContiguousTimes(pharmacy);
    expect(pharmacy.openingTimes.general.monday.length).to.equal(2);
    expect(pharmacy.openingTimes.general.monday[0].opens).to.equal('09:00');
    expect(pharmacy.openingTimes.general.monday[0].closes).to.equal('13:00');
    expect(pharmacy.openingTimes.general.monday[1].opens).to.equal('14:00');
    expect(pharmacy.openingTimes.general.monday[1].closes).to.equal('17:00');
  });

  it('should leave empty sessions unaltered', () => {
    const pharmacy = {
      openingTimes: {
        general: {
          monday: [],
        },
      },
    };

    joinContiguousTimes(pharmacy);
    expect(pharmacy.openingTimes.general.monday.length).to.equal(0);
  });

  it('should join multiple contiguous sessions in same day', () => {
    const pharmacy = {
      openingTimes: {
        general: {
          monday: [
            {
              opens: '09:00',
              closes: '12:00',
            },
            {
              opens: '12:00',
              closes: '13:00',
            },
            {
              opens: '14:00',
              closes: '17:00',
            },
            {
              opens: '17:00',
              closes: '19:30',
            },
          ],
        },
      },
    };

    joinContiguousTimes(pharmacy);
    expect(pharmacy.openingTimes.general.monday.length).to.equal(2);
    expect(pharmacy.openingTimes.general.monday[0].opens).to.equal('09:00');
    expect(pharmacy.openingTimes.general.monday[0].closes).to.equal('13:00');
    expect(pharmacy.openingTimes.general.monday[1].opens).to.equal('14:00');
    expect(pharmacy.openingTimes.general.monday[1].closes).to.equal('19:30');
  });

  it('should gracefully handle missing general opening times', () => {
    const pharmacy = {
      openingTimes: {
        alterations: {
          '2018-01-01': [{ opens: '09:00', closes: '19:30' }],
        },
      },
    };

    joinContiguousTimes(pharmacy);
    expect(pharmacy.openingTimes.general).to.be.undefined;
  });

  it('should gracefully handle missing alteration opening times', () => {
    const pharmacy = {
      openingTimes: {
        general: {
          monday: [{ opens: '09:00', closes: '19:30' }],
        },
      },
    };

    joinContiguousTimes(pharmacy);
    expect(pharmacy.openingTimes.alterations).to.be.undefined;
  });
});
