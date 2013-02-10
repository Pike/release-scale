/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
 
/*globals onmessage */

// The `probabilities` function computes the likelihood of shipping
// all of `N` locales, given the likelihood of a single locale
// `loclikely`, the maximum number of string-frozen `cycles`, and
// the maximum number of locales `maxloc`.
function probabilities(loclikely, cycles, maxloc) {
    var locales, fails, c, rv = [[1]], _rv;
    // The return value `probs` is a matrix, where each row consists of the
    // likelyhood of shipping all of N locales, starting with 0,
    // which always passes, thus the first column is 1.
    var probs = [[1]];
    // Without string freeze, the likelyhood is just the likelyhood
    // of one locale to the power of N.
    for (locales=1; locales <= maxloc; ++locales) {
        probs[0][locales] = Math.pow(loclikely, locales);
    }
    // generate string freeze cycles
    for (c=0; c < cycles; ++c) {
        // For each cycle, see how much we can recover.
        // `locales` is the number of locales in the full release.
        probs[c+1] = [1];
        for (locales=1; locales <= maxloc; ++locales) {
            // partition the 1: for `fails` out of `locales` locales failing,
            // pick up how likely we can fix that remaining task
            // with one cycle less
            probs[c+1][locales] = 0;
            for (fails=0; fails <=locales; ++fails) {
                // how likely is this case?
                // `p^(locales-fails)*(1-p)^(fails)*binomial(locales, fails)`
                _rv = Math.pow(loclikely, locales-fails)
                    * Math.pow(1-loclikely, fails)
                    * binomial(locales, fails);
                // and now compute how likely it is to fix the fails later
                // and multiplicate that
                _rv *= probs[c][fails];
                // The likelyhood of success is the sum over all
                // likelyhoods in the partitioned 1. Right?
                probs[c+1][locales] += _rv;
            }
        }
    }
    return probs;
}

var _bins = {};
function binomial(n, k) {
    if (n === 0) return 0;
    if (k === 0) return 1;
    if (_bins[n] === undefined) {
        _bins[n] = {};
    }
    else if (_bins[n][k] !== undefined) {
        return _bins[n][k];
    }
    var i, rv = 1;
    for (i = 1; i <= k; ++i) {
        rv = rv * (n - (k - i))/i;
    }
    _bins[n][k] = rv;
    return rv;
}

onmessage = function (event) {
    var params = event.data;
    postMessage(probabilities(params.likely, params.cycles, params.maxloc));
}