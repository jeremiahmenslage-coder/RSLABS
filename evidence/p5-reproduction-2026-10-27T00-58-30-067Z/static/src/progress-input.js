// Retained numeric behavior for recovery tooling; counter UI is Owner-hidden.
// Whole-step arrows start at 1; intentionally fractional saved values are not rounded.
export function configureProgressInput(input,{target=false}={}){input.type='number';input.min=target?'1':'0';input.step='1';}
