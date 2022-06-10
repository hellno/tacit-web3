/* eslint no-unused-vars: 0 */
export enum SharePageState {
  Default,
  ShareIntent,
  SolveIntent,
  PendingShare,
  PendingSolve,
  SuccessSubmitShare,
  SuccessSubmitSolve,
  FailSubmitShare,
  FailSubmitSolve,
}

export const shareStates = [
  SharePageState.ShareIntent,
  SharePageState.PendingShare,
  SharePageState.SuccessSubmitShare,
  SharePageState.FailSubmitShare
]
export const solveStates = [
  SharePageState.SolveIntent,
  SharePageState.PendingSolve,
  SharePageState.SuccessSubmitSolve,
  SharePageState.FailSubmitSolve
]

export enum CreateTaskState {
  Default,
  PendingUserInputBounty,
  DoneCreatingTask,
  PendingUploadToIpfs,
  PendingContractTransaction,
  PendingUserApproval,
  ErrorWalletConnect,
  ErrorCreatingTask,
}

// MUST BE SYNCED FROM ENUM DEFINED IN SMART CONTRACT AS SOURCE OF TRUTH
export enum NodeType {Task, Solution, Share}

export enum BiconomyLoadingState {
  Default,
  Init,
  Loading,
  Success,
  Error,
}
