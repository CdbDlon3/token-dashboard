import { FC } from "react"
import {
  BodyLg,
  BodyMd,
  LabelSm,
  Card,
  BoxLabel,
} from "@threshold-network/components"
import { useModal } from "../../hooks/useModal"
import { ModalType } from "../../enums"
import SubmitTxButton from "../../components/SubmitTxButton"
import InfoBox from "../../components/InfoBox"
import { useStakingState } from "../../hooks/useStakingState"
import { formatTokenAmount } from "../../utils/formatAmount"
import { HStack, Stack } from "@chakra-ui/react"
import { useTokenState } from "../../hooks/useTokenState"
import TokenBalance from "../../components/TokenBalance"
import { StakingContractLearnMore } from "../../components/ExternalLink"

const StakedPortfolioCard: FC = () => {
  const { openModal } = useModal()
  const { t } = useTokenState()

  const openStakingModal = async () => {
    openModal(ModalType.StakingChecklist)
  }

  const { stakedBalance } = useStakingState()

  return (
    <Card h="fit-content">
      <Stack spacing={6}>
        <LabelSm mb={6}>Staked Portfolio</LabelSm>
        <BodyMd mb={2}>Staked Balance</BodyMd>
        <InfoBox>
          <TokenBalance
            tokenAmount={stakedBalance.toString()}
            withSymbol
            tokenSymbol="T"
            isLarge
          />
        </InfoBox>
        <HStack justify="space-between" w="100%">
          <BoxLabel>Wallet</BoxLabel>
          <BodyLg>{formatTokenAmount(t.balance)} T</BodyLg>
        </HStack>
        <SubmitTxButton onSubmit={openStakingModal} submitText="Stake" />
        <StakingContractLearnMore />
      </Stack>
    </Card>
  )
}

export default StakedPortfolioCard
