
// Provide a default path to dwr.engine
if (dwr == null) var dwr = {};
if (dwr.engine == null) dwr.engine = {};
if (DWREngine == null) var DWREngine = dwr.engine;

if (AssignmentDWRFacade == null) var AssignmentDWRFacade = {};
AssignmentDWRFacade._path = '/webapps/assignment/dwr';
AssignmentDWRFacade.getSafeFileName = function(p0, callback) {
  dwr.engine._execute(AssignmentDWRFacade._path, 'AssignmentDWRFacade', 'getSafeFileName', p0, callback);
}
AssignmentDWRFacade.initContextFromRequestHeader = function(callback) {
  dwr.engine._execute(AssignmentDWRFacade._path, 'AssignmentDWRFacade', 'initContextFromRequestHeader', false, callback);
}
