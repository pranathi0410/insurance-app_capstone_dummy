import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { policyAPI } from '../../services/api';

const CreatePolicyWizard = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    insuredName: '',
    insuredType: 'INDIVIDUAL',
    lineOfBusiness: 'HEALTH',
    sumInsured: '',
    premium: '',
    retentionLimit: '',
    effectiveFrom: '',
    effectiveTo: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validateStep = () => {
    if (step === 1 && !form.insuredName) {
      setError('Please enter insured name');
      return false;
    }

    if (step === 2) {
      if (!form.sumInsured || !form.premium || !form.retentionLimit) {
        setError('Please fill all coverage fields');
        return false;
      }
      if (parseFloat(form.retentionLimit) > parseFloat(form.sumInsured)) {
        setError('Retention limit cannot exceed sum insured');
        return false;
      }
    }

    if (step === 3 && !form.effectiveFrom) {
      setError('Please select effective from date');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsSubmitting(true);
    try {
      await policyAPI.createPolicy({
        ...form,
        sumInsured: parseFloat(form.sumInsured),
        premium: parseFloat(form.premium),
        retentionLimit: parseFloat(form.retentionLimit)
      });

      navigate('/policy');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black px-6 py-12">
      <div className="max-w-3xl mx-auto bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-10 shadow-2xl">

        <h2 className="text-3xl font-bold text-white mb-8">
          Create New Policy
        </h2>

        {/* Step Indicators */}
        <div className="flex justify-between mb-10">
          {[1,2,3,4].map((s) => (
            <div
              key={s}
              className={`w-12 h-12 flex items-center justify-center rounded-full font-semibold transition-all
                ${step >= s
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-400'
                }`}
            >
              {s}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/40 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Insured Name *
                </label>
                <input
                  type="text"
                  name="insuredName"
                  value={form.insuredName}
                  onChange={handleChange}
                  placeholder="Enter insured name"
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Insured Type *
                </label>
                <select
                  name="insuredType"
                  value={form.insuredType}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="CORPORATE">Corporate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Line of Business *
                </label>
                <select
                  name="lineOfBusiness"
                  value={form.lineOfBusiness}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="HEALTH">Health</option>
                  <option value="MOTOR">Motor</option>
                  <option value="LIFE">Life</option>
                  <option value="PROPERTY">Property</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="mt-4 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-medium hover:opacity-90 transition"
              >
                Next
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              {['sumInsured','premium','retentionLimit'].map(field => (
                <div key={field}>
                  <label className="block text-sm text-slate-400 mb-2 capitalize">
                    {field.replace(/([A-Z])/g, ' $1')} *
                  </label>
                  <input
                    type="number"
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              ))}

              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-lg bg-slate-700 text-white hover:bg-slate-600"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white"
                >
                  Next
                </button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Effective From *
                </label>
                <input
                  type="date"
                  name="effectiveFrom"
                  value={form.effectiveFrom}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Effective To
                </label>
                <input
                  type="date"
                  name="effectiveTo"
                  value={form.effectiveTo}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-lg bg-slate-700 text-white"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white"
                >
                  Review
                </button>
              </div>
            </>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <>
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 text-slate-300 space-y-2">
                {Object.entries(form).map(([key, value]) => (
                  <p key={key}>
                    <strong className="text-white capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}:
                    </strong>{' '}
                    {value || '-'}
                  </p>
                ))}
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-lg bg-slate-700 text-white"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                >
                  {isSubmitting ? 'Creating...' : 'Create Policy'}
                </button>
              </div>
            </>
          )}

        </form>
      </div>
    </div>
  );
};

export default CreatePolicyWizard;
