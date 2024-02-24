import { StakeData, TRMEntity, TRMRiskIndicator } from "../../types"
import { isAddressZero, isSameETHAddress } from "../../web3/utils"
import { AppListenerEffectAPI } from "../listener"
import { setStakes } from "../staking"
import {
  accountUsedAsStakingProvider,
  accountSlice,
  fetchingOperatorMapping,
  setMappedOperators,
  fetchingTrm,
  setTrm,
} from "./slice"
import { fetchWalletScreening } from "../../utils/trmAPI"

export const getStakingProviderOperatorInfo = async (
  action: ReturnType<typeof setStakes>,
  listenerApi: AppListenerEffectAPI
) => {
  try {
    const { account } = listenerApi.getState()
    const { address } = account
    const stakes = action.payload

    const stake = stakes.find((_: StakeData) =>
      isSameETHAddress(_.stakingProvider, address)
    )

    let isStakingProvider = false

    if (stake) {
      isStakingProvider = true
    } else {
      const { owner, authorizer, beneficiary } =
        await listenerApi.extra.threshold.staking.rolesOf(address)

      isStakingProvider =
        !isAddressZero(owner) &&
        !isAddressZero(authorizer) &&
        !isAddressZero(beneficiary)
    }

    if (!isStakingProvider) return

    listenerApi.dispatch(fetchingOperatorMapping())

    listenerApi.dispatch(accountUsedAsStakingProvider())

    const mappedOperators =
      await listenerApi.extra.threshold.multiAppStaking.getMappedOperatorsForStakingProvider(
        address
      )

    listenerApi.dispatch(
      setMappedOperators({
        tbtc: mappedOperators.tbtc,
        randomBeacon: mappedOperators.randomBeacon,
        taco: mappedOperators.taco,
      })
    )
  } catch (error: any) {
    listenerApi.dispatch(
      accountSlice.actions.setOperatorMappingError({
        error,
      })
    )
    throw new Error("Could not load staking provider's operator info: " + error)
  }
}

export const getTRMInfo = async (
  action: ReturnType<typeof accountSlice.actions.walletConnected>,
  listenerApi: AppListenerEffectAPI
) => {
  const { address, chainId } = action.payload
  if (!address || !chainId) return

  try {
    listenerApi.dispatch(fetchingTrm())
    const data = await fetchWalletScreening({ address, chainId: chainId })

    const riskIndicators: TRMRiskIndicator[] =
      data[0]?.addressRiskIndicators || []
    const entities: TRMEntity[] = data[0]?.entities || []

    const hasSevereRisk = riskIndicators.some(
      (indicator) => indicator.categoryRiskScoreLevelLabel === "Severe"
    )
    const hasSevereEntity = entities.some(
      (entity) => entity.riskScoreLevelLabel === "Severe"
    )

    const isBlocked = hasSevereEntity || hasSevereRisk

    listenerApi.dispatch(setTrm({ isBlocked }))
  } catch (error: any) {
    listenerApi.dispatch(
      accountSlice.actions.setTrmError({
        error,
      })
    )
    throw new Error("Could not load TRM Wallet Screening info: " + error)
  }
}
