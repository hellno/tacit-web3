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
  DoneCreatingTask,
  PendingUploadToIpfs,
  PendingContractTransaction,
  ErrorWalletConnect,
  ErrorCreatingTask,
}

// MUST BE SYNCED TO ENUM DEFINED IN SMART CONTRACT
export enum NodeType {Task, Solution, Share}
