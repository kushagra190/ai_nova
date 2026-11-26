import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { SAMPLE_INCIDENT_TEXT } from '../sampleIncident.js'

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000'
const api = axios.create({ baseURL: `${API_URL}/api/rca` })

function getErrorMessage(error) {
  if (!error.response) {
    return `Cannot reach the backend at ${API_URL}. Is "uvicorn app.main:app --reload" running?`
  }
  const detail = error.response.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join('; ')
  return `Request failed (HTTP ${error.response.status}).`
}

const emptyForm = {
  deviation_id: '',
  title: '',
  api_product_name: '',
  batch_number: '',
  department: '',
  incident_date: '',
  severity: 'Minor',
  incident_summary: '',
  investigation_method: '5 Whys',
  five_whys: [],
  fishbone: {
    manpower: [],
    machine_equipment: [],
    material: [],
    method_process: [],
    measurement: [],
    environment: [],
  },
  potential_root_causes: [],
  contributing_factors: [],
  missing_evidence: [],
  capa_recommendations: [],
  qa_reviewer_notes: '',
  status: 'Draft - AI Suggested',
}

const emptyCapa = {
  action_type: 'Corrective',
  action_description: '',
  rationale: '',
  owner_department: '',
  target_days: 30,
}

const initialState = {
  formData: emptyForm,
  savedId: null,
  intakeText: '',
  selectedMethod: '5 Whys',
  activeTab: '5whys',
  hasAnalysis: false,
  loading: false,
  saving: false,
  error: null,
  successMessage: null,
  savedList: [],
  savedListLoading: false,
}

export const analyzeText = createAsyncThunk(
  'rca/analyzeText',
  async ({ text, method }, { rejectWithValue }) => {
    try {
      const response = await api.post('/analyze-text', { text, method })
      return response.data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

export const analyzePdf = createAsyncThunk(
  'rca/analyzePdf',
  async ({ file, method }, { rejectWithValue }) => {
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('method', method)
      const response = await api.post('/analyze-pdf', body)
      return response.data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

const cleanList = (items) => items.map((item) => item.trim()).filter(Boolean)

function cleanFormData(formData) {
  const fishbone = {}
  for (const [category, items] of Object.entries(formData.fishbone)) {
    fishbone[category] = cleanList(items)
  }
  return {
    ...formData,
    fishbone,
    contributing_factors: cleanList(formData.contributing_factors),
    missing_evidence: cleanList(formData.missing_evidence),
  }
}

export const saveInvestigation = createAsyncThunk(
  'rca/saveInvestigation',
  async (_, { getState, rejectWithValue }) => {
    const { formData, savedId } = getState().rca
    const body = cleanFormData(formData)
    try {
      const response = savedId
        ? await api.put(`/investigations/${savedId}`, body)
        : await api.post('/investigations', body)
      return response.data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

export const fetchSavedInvestigations = createAsyncThunk(
  'rca/fetchSavedInvestigations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/investigations')
      return response.data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

export const loadSampleText = createAsyncThunk('rca/loadSampleText', async () => {
  try {
    const response = await api.get('/sample-incident')
    return response.data.text || SAMPLE_INCIDENT_TEXT
  } catch {
    return SAMPLE_INCIDENT_TEXT
  }
})

function fillForm(state, rca) {
  const { id: _id, created_at: _created_at, ...fields } = rca
  state.formData = {
    ...emptyForm,
    ...fields,
    fishbone: { ...emptyForm.fishbone, ...(fields.fishbone || {}) },
  }
  state.activeTab = state.formData.investigation_method === 'Fishbone' ? 'fishbone' : '5whys'
  state.hasAnalysis = true
}

const rcaSlice = createSlice({
  name: 'rca',
  initialState,
  reducers: {
    setIntakeText: (state, action) => {
      state.intakeText = action.payload
    },
    setSelectedMethod: (state, action) => {
      state.selectedMethod = action.payload
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload
    },

    updateField: (state, action) => {
      const { field, value } = action.payload
      state.formData[field] = value
    },

    updateFiveWhy: (state, action) => {
      const { index, field, value } = action.payload
      state.formData.five_whys[index][field] = value
    },
    addFiveWhy: (state) => {
      const steps = state.formData.five_whys
      steps.push({ why_number: steps.length + 1, question: '', answer: '', evidence_reference: '' })
    },
    removeFiveWhy: (state, action) => {
      state.formData.five_whys.splice(action.payload, 1)
      state.formData.five_whys.forEach((step, i) => (step.why_number = i + 1))
    },

    updateFishbone: (state, action) => {
      const { category, items } = action.payload
      state.formData.fishbone[category] = items
    },

    updateRootCause: (state, action) => {
      const { index, field, value } = action.payload
      state.formData.potential_root_causes[index][field] = value
    },
    toggleVerifyCause: (state, action) => {
      const cause = state.formData.potential_root_causes[action.payload]
      cause.is_verified = !cause.is_verified
    },

    addCapa: (state) => {
      state.formData.capa_recommendations.push({ ...emptyCapa })
    },
    updateCapa: (state, action) => {
      const { index, field, value } = action.payload
      state.formData.capa_recommendations[index][field] =
        field === 'target_days' ? Math.max(0, parseInt(value, 10) || 0) : value
    },
    removeCapa: (state, action) => {
      state.formData.capa_recommendations.splice(action.payload, 1)
    },

    loadExistingInvestigation: (state, action) => {
      fillForm(state, action.payload)
      state.savedId = action.payload.id
      state.selectedMethod = state.formData.investigation_method
      state.error = null
      state.successMessage = `Loaded investigation #${action.payload.id} from the database.`
    },

    resetForm: (state) => {
      state.formData = emptyForm
      state.savedId = null
      state.hasAnalysis = false
      state.error = null
      state.successMessage = null
    },

    clearMessages: (state) => {
      state.error = null
      state.successMessage = null
    },
  },

  extraReducers: (builder) => {
    for (const thunk of [analyzeText, analyzePdf]) {
      builder
        .addCase(thunk.pending, (state) => {
          state.loading = true
          state.error = null
          state.successMessage = null
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.loading = false
          fillForm(state, action.payload)
          state.savedId = null
          state.successMessage = 'AI analysis complete. Review and verify every field before saving.'
        })
        .addCase(thunk.rejected, (state, action) => {
          state.loading = false
          state.error = action.payload || 'AI analysis failed.'
        })
    }

    builder
      .addCase(saveInvestigation.pending, (state) => {
        state.saving = true
        state.error = null
        state.successMessage = null
      })
      .addCase(saveInvestigation.fulfilled, (state, action) => {
        state.saving = false
        state.savedId = action.payload.id
        state.successMessage = `Investigation #${action.payload.id} saved to the database.`
        state.savedList = [action.payload, ...state.savedList.filter((r) => r.id !== action.payload.id)]
      })
      .addCase(saveInvestigation.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload || 'Saving failed.'
      })

      .addCase(fetchSavedInvestigations.pending, (state) => {
        state.savedListLoading = true
        state.error = null
      })
      .addCase(fetchSavedInvestigations.fulfilled, (state, action) => {
        state.savedListLoading = false
        state.savedList = action.payload
      })
      .addCase(fetchSavedInvestigations.rejected, (state, action) => {
        state.savedListLoading = false
        state.error = action.payload || 'Could not load saved investigations.'
      })

      .addCase(loadSampleText.fulfilled, (state, action) => {
        state.intakeText = action.payload
        state.error = null
      })
  },
})

export const {
  setIntakeText,
  setSelectedMethod,
  setActiveTab,
  updateField,
  updateFiveWhy,
  addFiveWhy,
  removeFiveWhy,
  updateFishbone,
  updateRootCause,
  toggleVerifyCause,
  addCapa,
  updateCapa,
  removeCapa,
  loadExistingInvestigation,
  resetForm,
  clearMessages,
} = rcaSlice.actions

export default rcaSlice.reducer
