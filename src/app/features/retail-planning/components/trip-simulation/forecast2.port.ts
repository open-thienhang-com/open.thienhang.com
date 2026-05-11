// Minimal Angular port of legacy forecast2.js controls used by the v1 fragment.
// This file exposes initForecast2 and updateForecast2ButtonState which mirror
// the original global functions so legacy HTML can interact with them.

import { SimulationRunnerService } from '../../services/simulation-runner.service';
import { SimulationRequest } from '../../services/simulation.service';
import { PlanItem } from '../../services/simulation-converter.service';

export function updateForecast2ButtonStatePort() {
    try {
        const btn = document.getElementById('btn-run-forecast-2') as HTMLButtonElement | null;
        const from = document.getElementById('sim-date-from-2') as HTMLInputElement | null;
        const to = document.getElementById('sim-date-to-2') as HTMLInputElement | null;
        const planInput = document.getElementById('sim-plan-id-2') as HTMLInputElement | null;

        if (!btn) {
            console.log('[updateForecast2ButtonState] Button not found');
            return;
        }

        const hasDates = !!(from && from.value && to && to.value);

        // Check for plan from multiple sources
        let hasPlan = false;
        
        // Check planningState
        const planningState = (window as any).planningState;
        if (planningState) {
            hasPlan = !!(planningState.selectedPlanId || 
                        planningState.selectedPlan || 
                        planningState.currentPlan);
        }
        
        // Check legacy top-level variables
        if (!hasPlan) {
            hasPlan = !!(window as any).selectedPlanId || !!(window as any).selectedPlan;
        }
        
        // Check DOM input field
        if (!hasPlan && planInput && planInput.value && planInput.value.trim()) {
            hasPlan = true;
        }

        const shouldEnable = hasDates && hasPlan;
        btn.disabled = !shouldEnable;
        
        console.log('[updateForecast2ButtonState]', {
            hasDates,
            hasPlan,
            shouldEnable,
            selectedPlanId: planningState?.selectedPlanId,
            hasSelectedPlan: !!planningState?.selectedPlan,
            planInputValue: planInput?.value
        });
    } catch (e) {
        console.warn('updateForecast2ButtonStatePort error', e);
    }
}

export function initForecast2Port() {
    try {
        const from = document.getElementById('sim-date-from-2') as HTMLInputElement | null;
        const to = document.getElementById('sim-date-to-2') as HTMLInputElement | null;
        const btn = document.getElementById('btn-run-forecast-2') as HTMLButtonElement | null;

        // Helper to format YYYY-MM-DD
        const fmt = (d: Date) => d.toISOString().slice(0, 10);

        if (from && !from.value) {
            const d = new Date();
            from.value = fmt(d);
        }
        if (to && !to.value) {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            to.value = fmt(d);
        }

        // Attach listeners to re-evaluate button state
        [from, to].forEach(el => {
            if (!el) return;
            el.removeEventListener('input', updateForecast2ButtonStatePort as any);
            el.addEventListener('input', updateForecast2ButtonStatePort as any);
        });

        // Wire run button to call existing legacy runner if present, or fallback
        if (btn) {
            btn.removeEventListener('click', runForecast2Port as any);
            btn.addEventListener('click', runForecast2Port as any);
        }

        // Also attach to plan selection changes if possible by polling planningState
        // (legacy code often sets window.selectedPlanId/window.selectedPlanData)
        // We'll call updateForecast2ButtonState once now to set initial state
        setTimeout(() => updateForecast2ButtonStatePort(), 0);
    } catch (e) {
        console.warn('initForecast2Port error', e);
    }
}

export async function runForecast2Port(e?: Event) {
    try {
        // Ensure planningState.selectedPlan exists (fallback to selectedPlanId)
        try {
            (window as any).planningState = (window as any).planningState || {};
            if (!(window as any).planningState.selectedPlan && (window as any).planningState.selectedPlanId) {
                (window as any).planningState.selectedPlan = { id: (window as any).planningState.selectedPlanId };
            }
            // Also mirror legacy top-level selectedPlanId if present
            if (!(window as any).planningState.selectedPlanId && (window as any).selectedPlanId) {
                (window as any).planningState.selectedPlanId = (window as any).selectedPlanId;
            }
            // If DOM input exists but planningState missing id, copy it
            try {
                const planInput = document.getElementById('sim-plan-id-2') as HTMLInputElement | null;
                if (planInput && planInput.value && !(window as any).planningState.selectedPlan) {
                    (window as any).planningState.selectedPlan = { id: planInput.value };
                    (window as any).planningState.selectedPlanId = planInput.value;
                }
            } catch (inner) { }
        } catch (inner) { }

        // At call time, prefer any legacy runner currently attached on window (avoid recursion)
        const winRunForecast = (window as any).runForecast2;
        const winRunSim = (window as any).runSimulationForecast;
        if (typeof winRunForecast === 'function' && winRunForecast !== runForecast2Port) {
            try { await (winRunForecast as Function)(); return; } catch (err) { console.warn('window.runForecast2 threw', err); }
        }
        if (typeof winRunSim === 'function' && winRunSim !== runForecast2Port) {
            try { await (winRunSim as Function)(); return; } catch (err) { console.warn('window.runSimulationForecast threw', err); }
        }

        // Fall back to any legacy runner captured earlier (module-load-time)
        const legacyRun = (runForecast2Port as any)._legacyRunForecast2 as Function | undefined;
        const legacyRunSim = (runForecast2Port as any)._legacyRunSimulationForecast as Function | undefined;
        if (typeof legacyRun === 'function') {
            try { legacyRun(); return; } catch (err) { console.warn('legacy runForecast2 threw', err); }
        }
        if (typeof legacyRunSim === 'function') {
            try { legacyRunSim(); return; } catch (err) { console.warn('legacy runSimulationForecast threw', err); }
        }

        // If none exist, do a minimal fallback: call the v1 prediction endpoint similarly
        // Try to get plan_id from multiple sources
        let planId: string | null = null;
        
        // First try from input field (most reliable)
        const planInput = document.getElementById('sim-plan-id-2') as HTMLInputElement | null;
        if (planInput && planInput.value && planInput.value.trim()) {
            planId = planInput.value.trim();
        }
        
        // Fallback to planningState
        if (!planId) {
            planId = (window as any).planningState?.selectedPlan?.id || 
                     (window as any).planningState?.selectedPlan?.plan_id ||
                     (window as any).planningState?.selectedPlan?.uuid ||
                     (window as any).planningState?.selectedPlanId || 
                     (window as any).selectedPlanId || null;
        }
        
        // Clean up planId - remove whitespace and ensure it's a valid string
        if (planId) {
            planId = String(planId).trim();
            // Validate ObjectId format (24 hex characters)
            if (planId.length === 0 || (planId.length !== 24 && !/^[0-9a-fA-F]{24}$/.test(planId))) {
                console.warn('[forecast2.port] Invalid plan_id format:', planId);
                planId = null;
            }
        }
        
        const from = (document.getElementById('sim-date-from-2') as HTMLInputElement | null)?.value;
        const to = (document.getElementById('sim-date-to-2') as HTMLInputElement | null)?.value;
        const modelId = (document.getElementById('sim-model-id-2') as HTMLInputElement | null)?.value?.trim() || '';
        const bufferThroughputEl = document.getElementById('buffer-throughput-2') as HTMLInputElement | null;
        const bufferThroughput = bufferThroughputEl ? parseFloat(bufferThroughputEl.value || '1.0') : 1.0;
        const persistEl = document.getElementById('persist-prediction-2') as HTMLInputElement | null;
        const persist = persistEl ? persistEl.checked : false;

        console.log('[forecast2.port] runForecast2 fallback; calling prediction API with', { planId, from, to, modelId, bufferThroughput, persist });
        if (!planId || planId.length === 0) {
            console.error('[forecast2.port] Missing planId');
            return;
        }
        if (!from || !to) {
            console.error('[forecast2.port] Missing date range');
            return;
        }

        try {
            const simButton = document.getElementById('btn-run-forecast-2') as HTMLButtonElement | null;
            if (simButton) {
                simButton.disabled = true;
                simButton.innerHTML = 'Đang mô phỏng...';
            }

            // Use an absolute backend base URL if available to avoid dev-server 404s
            // (frontend dev server runs on :4200 and a relative URL would hit the frontend)
            const apiBase = (window as any).__API_BASE__ || (window as any).API_BASE || (window as any).__env && (window as any).__env.API_BASE || 'http://localhost:8081';
            // Correct endpoint for prediction (plan predict)
            const predictionUrl = apiBase.replace(/\/$/, '') + '/routing-deviation/internal/plan/predict';

            // Try to add Authorization header from common places used in the app
            const headers: any = { 'Content-Type': 'application/json' };
            try {
                // Use the same token as ApiService
                const defaultToken = 'ZCXb4Thq56HgXlQC4IKS4EcghaYt6xxmIoHdazBJgVBRAwYqbLhx9rE3QTuzIqpo';
                const token = (window as any).__AUTH_TOKEN__ || (window as any).API_TOKEN || localStorage.getItem('token') || localStorage.getItem('auth_token') || localStorage.getItem('access_token') || defaultToken;
                if (token) headers['Authorization'] = token.startsWith('Bearer') ? token : `Bearer ${token}`;
            } catch (e) { 
                // Fallback to default token if all else fails
                headers['Authorization'] = 'Bearer ZCXb4Thq56HgXlQC4IKS4EcghaYt6xxmIoHdazBJgVBRAwYqbLhx9rE3QTuzIqpo';
            }

            // Build request body according to backend API format
            const requestBody: SimulationRequest = {
                plan_id: planId,
                model_id: modelId || '',
                from_date: from,
                buffer_throughtput: bufferThroughput,
                to_date: to,
                persist: persist,
                simulation: {}
            };

            // Try to use Angular service if available
            const runnerService = SimulationRunnerService.getInstance();
            if (runnerService) {
                console.log('[forecast2.port] Using Angular SimulationRunnerService');
                try {
                    await runnerService.runSimulationAndRender(requestBody, 'simulation-table-body-2');
                    console.log('[forecast2.port] Simulation completed successfully using Angular service');
                    return;
                } catch (error) {
                    console.error('[forecast2.port] Angular service failed, falling back to legacy:', error);
                    // Fall through to legacy implementation
                }
            }

            // Fallback to legacy implementation if Angular service not available
            console.log('[forecast2.port] Using legacy fetch implementation');
            const legacyApiBase = (window as any).__API_BASE__ || (window as any).API_BASE || (window as any).__env && (window as any).__env.API_BASE || 'http://localhost:8081';
            const legacyPredictionUrl = legacyApiBase.replace(/\/$/, '') + '/routing-deviation/internal/plan/predict';

            const legacyHeaders: any = { 'Content-Type': 'application/json' };
            try {
                const defaultToken = 'ZCXb4Thq56HgXlQC4IKS4EcghaYt6xxmIoHdazBJgVBRAwYqbLhx9rE3QTuzIqpo';
                const token = (window as any).__AUTH_TOKEN__ || (window as any).API_TOKEN || localStorage.getItem('token') || localStorage.getItem('auth_token') || localStorage.getItem('access_token') || defaultToken;
                if (token) legacyHeaders['Authorization'] = token.startsWith('Bearer') ? token : `Bearer ${token}`;
            } catch (e) {
                legacyHeaders['Authorization'] = 'Bearer ZCXb4Thq56HgXlQC4IKS4EcghaYt6xxmIoHdazBJgVBRAwYqbLhx9rE3QTuzIqpo';
            }

            const response = await fetch(legacyPredictionUrl, {
                method: 'POST',
                headers: legacyHeaders,
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const jsonResponse = await response.json();
            console.log('[forecast2.port] API response:', jsonResponse);
            
            const result = jsonResponse.data || jsonResponse;
            console.log('[forecast2.port] Unwrapped result:', result);
            
            if ((window as any).planningState) {
                (window as any).planningState.simulationData = result;
            }
            
            // Use Angular converter if available
            let dataToRender: PlanItem[] = [];
            if (runnerService) {
                try {
                    dataToRender = runnerService.convertResponseToPlan(result);
                    console.log('[forecast2.port] Converted using Angular service:', dataToRender);
                } catch (e) {
                    console.warn('[forecast2.port] Angular converter failed, using legacy:', e);
                }
            }
            
            // Fallback to legacy conversion if Angular not available or failed
            if (dataToRender.length === 0) {
                // Try legacy convertPredictResponseToPlan
                if (typeof (window as any).convertPredictResponseToPlan === 'function') {
                    try {
                        dataToRender = (window as any).convertPredictResponseToPlan(result);
                        console.log('[forecast2.port] Converted using legacy function:', dataToRender);
                    } catch (e) {
                        console.error('[forecast2.port] Legacy conversion failed:', e);
                    }
                } else {
                    console.warn('[forecast2.port] convertPredictResponseToPlan not available, result may not be in correct format');
                }
            }
            
            // Render table
            await new Promise(resolve => setTimeout(resolve, 300));
            const tbody = document.getElementById('simulation-table-body-2');
            if (!tbody) {
                console.error('[forecast2.port] simulation-table-body-2 not found in DOM!');
                return;
            }
            
            // Use Angular table service if available and we have converted data
            if (runnerService && dataToRender.length > 0) {
                try {
                    runnerService.renderTable(dataToRender, 'simulation-table-body-2');
                    console.log('[forecast2.port] Table rendered using Angular service');
                    return;
                } catch (e) {
                    console.warn('[forecast2.port] Angular table renderer failed, using legacy:', e);
                }
            }
            
            // Fallback to legacy renderer
            if (typeof (window as any).renderForecast2Table === 'function') {
                try {
                    // Only pass converted data if available, otherwise let renderForecast2Table handle conversion
                    if (dataToRender.length > 0) {
                        console.log('[forecast2.port] Rendering with converted data:', dataToRender);
                        (window as any).renderForecast2Table(dataToRender);
                    } else if (result && result.schedule) {
                        // If we have unwrapped result with schedule, pass it (renderForecast2Table may handle it)
                        console.log('[forecast2.port] Rendering with unwrapped result (has schedule):', result);
                        (window as any).renderForecast2Table(result);
                    } else {
                        console.error('[forecast2.port] No valid data to render');
                        tbody.innerHTML = `<tr><td colspan="15" class="px-6 py-8 text-left text-sm text-red-600">
                            Không có dữ liệu để hiển thị. Vui lòng kiểm tra console.
                        </td></tr>`;
                        return;
                    }
                    console.log('[forecast2.port] Table rendered using legacy function');
                } catch (err) {
                    console.error('[forecast2.port] Legacy renderer failed:', err);
                    tbody.innerHTML = `<tr><td colspan="15" class="px-6 py-8 text-left text-sm text-red-600">
                        Lỗi khi render bảng: ${(err as Error).message || String(err)}
                    </td></tr>`;
                }
            } else {
                console.error('[forecast2.port] No renderer available');
                tbody.innerHTML = `<tr><td colspan="15" class="px-6 py-8 text-left text-sm text-red-600">
                    Không thể render bảng. Vui lòng kiểm tra console.
                </td></tr>`;
            }
            
            console.log('[forecast2.port] Simulation completed successfully');
        } catch (err) {
            console.error('[forecast2.port] runForecast2Port fallback error', err);
            const msg = (err as any && (err as any).message) ? (err as any).message : String(err);
            console.error('[forecast2.port] Simulation error:', msg);
        } finally {
            const simButton = document.getElementById('btn-run-forecast-2') as HTMLButtonElement | null;
            if (simButton) {
                simButton.disabled = false;
                simButton.innerHTML = 'Mô phỏng';
            }
        }
    } catch (e) {
        console.warn('runForecast2Port error', e);
    }
}

// Expose on window so legacy initialization code can call them if expected
declare global {
    interface Window { initForecast2?: () => void; updateForecast2ButtonState?: () => void; runForecast2?: () => void; }
}

// Capture any existing legacy runners so runForecast2Port can call them
(runForecast2Port as any)._legacyRunForecast2 = (window as any).runForecast2;
(runForecast2Port as any)._legacyRunSimulationForecast = (window as any).runSimulationForecast;

window.initForecast2 = initForecast2Port;
window.updateForecast2ButtonState = updateForecast2ButtonStatePort;
window.runForecast2 = runForecast2Port;
