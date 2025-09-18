function ensureHodBranchAccess(req, res, next) {
  try {
    const user = req.user || {};
    const userBranch = (user.branch || 'CSE').toString().toUpperCase();
    if (user.role !== 'hod') return res.status(403).json({ msg: 'Forbidden' });

    if (req.params && req.params.branch) {
      const paramBranch = req.params.branch.toString().toUpperCase();
      if (paramBranch !== userBranch) {
        return res.status(403).json({ msg: 'Branch access denied' });
      }
    } else {
      req.params = req.params || {};
      req.params.branch = userBranch;
    }
    req.hodBranch = userBranch;
    return next();
  } catch (e) {
    return res.status(400).json({ msg: 'Invalid branch' });
  }
}

module.exports = { ensureHodBranchAccess };

function ensureTeacherBranchAccess(req, res, next) {
  try {
    const user = req.user || {};
    const userBranch = (user.branch || 'CSE').toString().toUpperCase();
    if (user.role !== 'teacher') return res.status(403).json({ msg: 'Forbidden' });

    if (req.params && req.params.branch) {
      const paramBranch = req.params.branch.toString().toUpperCase();
      if (paramBranch !== userBranch) {
        return res.status(403).json({ msg: 'Branch access denied' });
      }
    } else {
      req.params = req.params || {};
      req.params.branch = userBranch;
    }
    req.teacherBranch = userBranch;
    return next();
  } catch (e) {
    return res.status(400).json({ msg: 'Invalid branch' });
  }
}

module.exports.ensureTeacherBranchAccess = ensureTeacherBranchAccess;


