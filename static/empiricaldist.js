// EmpiricalDist JS Library to simulate Pmf (Probability Mass Function)

export class Pmf {
    constructor(values = []) {
        this.values = new Map();
        if (values.length > 0) {
            this.initialize(values);
        }
    }

    // Initialize PMF from an array of values (uniform probability)
    initialize(values) {
        const prob = 1 / values.length;
        values.forEach(value => {
            this.values.set(value, prob);
        });
    }

    // Set a value with a specific probability
    set(value, prob) {
        this.values.set(value, prob);
    }

    // Get the probability of a specific value
    get(value) {
        return this.values.get(value) || 0;
    }

    // Update the probability of a value by multiplying with a factor (likelihood)
    update(value, likelihood) {
        if (this.values.has(value)) {
            this.values.set(value, this.values.get(value) * likelihood);
        }
    }

    // Normalize the PMF so that the sum of all probabilities equals 1
    normalize() {
        const total = Array.from(this.values.values()).reduce((acc, prob) => acc + prob, 0);
        if (total > 0) {
            let maxProbability = -Infinity;  // Initialize to a very low value to find the maximum
            for (let key of this.values.keys()) {
                let normalizedValue = this.values.get(key) / total;
                this.values.set(key, normalizedValue);

                // Track the maximum value while normalizing
                if (normalizedValue > maxProbability) {
                    maxProbability = normalizedValue;
                }
            }
            return maxProbability;  // Return the maximum normalized probability value
        }
        return 0;  // If total is zero, return 0 to indicate no valid maximum
    }
    // Return an array of probabilities (ps)
    getProbabilities() {
        return Array.from(this.values.values());
    }

    // Return an array of keys (qs)
    getValues() {
        return Array.from(this.values.keys());
    }

    // Multiply a value's probability by a likelihood and normalize the PMF
    applyLikelihood(value, likelihood) {
        this.update(value, likelihood);
        this.normalize();
    }
}

// // Example usage
// const pmf = new Pmf([0, 1, 2, 3, 4, 5]);
// console.log('Initial PMF:', pmf.getProbabilities());

// // Update probabilities with likelihood
// pmf.applyLikelihood(3, 0.5);
// console.log('Updated PMF after applying likelihood to value 3:', pmf.getProbabilities());

// // Set a new value
// pmf.set(6, 0.2);
// pmf.normalize();
// console.log('Normalized PMF after adding value 6:', pmf.getProbabilities());
