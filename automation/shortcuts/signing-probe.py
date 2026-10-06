import plistlib
from pathlib import Path
p=Path('shortcut-output')
p.mkdir(exist_ok=True)
shortcut={
 'WFWorkflowName':'Fungo Italia — verifica installazione',
 'WFWorkflowClientVersion':'2600.0.1',
 'WFWorkflowMinimumClientVersion':900,
 'WFWorkflowMinimumClientVersionString':'900',
 'WFWorkflowActions':[{'WFWorkflowActionIdentifier':'is.workflow.actions.alert','WFWorkflowActionParameters':{'WFAlertActionTitle':'Fungo Italia','WFAlertActionMessage':'Verifica di installazione. Questo comando non legge fotografie.','WFAlertActionCancelButtonShown':False}}],
 'WFWorkflowIcon':{'WFWorkflowIconGlyphNumber':59511,'WFWorkflowIconStartColor':4282601983},
 'WFWorkflowTypes':[],
 'WFWorkflowInputContentItemClasses':[],
 'WFWorkflowOutputContentItemClasses':[],
 'WFWorkflowImportQuestions':[],
 'WFWorkflowHasOutputFallback':False,
}
with (p/'Signing-Probe.unsigned.shortcut').open('wb') as f:
 plistlib.dump(shortcut,f,fmt=plistlib.FMT_BINARY)
print('Generated structurally valid probe without Photos or network actions.')
