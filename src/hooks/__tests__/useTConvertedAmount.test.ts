import { renderHook } from "@testing-library/react-hooks"
import { useTConvertedAmount } from "../useTConvertedAmount"
import { useVendingMachineRatio } from "../../web3/hooks/useVendingMachineRatio"
import { Token } from "../../enums"

jest.mock("../../web3/hooks/useVendingMachineRatio", () => ({
  useVendingMachineRatio: jest.fn(),
}))

describe("Test `useTConvertedAmount` hook", () => {
  const token = Token.Nu
  const mocedNuRatio = "4500000000000000" // 0.0045
  const amountToConvert = "1000000000000000000" // 1
  const expectedTAmount = "4500000000000000000" // 4.5

  beforeEach(() => {
    ;(useVendingMachineRatio as jest.Mock).mockReturnValue(mocedNuRatio)
  })

  test("should convert token amount to T", () => {
    const { result } = renderHook(() =>
      useTConvertedAmount(token, amountToConvert)
    )

    expect(useVendingMachineRatio).toHaveBeenCalledWith(token)
    expect(result.current.amount).toEqual(expectedTAmount)
    expect(result.current.formattedAmount).toEqual("4.50")
  })

  test.each`
    value
    ${null}
    ${"0"}
  `("should return default values if ratio is $value ", ({ value }) => {
    ;(useVendingMachineRatio as jest.Mock).mockReturnValue(value)
    const { result } = renderHook(() =>
      useTConvertedAmount(token, amountToConvert)
    )

    expect(useVendingMachineRatio).toHaveBeenCalledWith(token)
    expect(result.current.amount).toEqual("0")
    expect(result.current.formattedAmount).toEqual("--")
  })

  test("should return default values if an amount is not defined", () => {
    const { result } = renderHook(() => useTConvertedAmount(token, null))

    expect(useVendingMachineRatio).toHaveBeenCalledWith(token)
    expect(result.current.amount).toEqual("0")
    expect(result.current.formattedAmount).toEqual("--")
  })
})
