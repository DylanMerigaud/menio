import { invariant } from '../invariant'

describe('invariant utility', () => {
  it('should not throw for defined values', () => {
    const value = 'test'
    expect(() => invariant(value)).not.toThrow()

    const numberValue = 0
    expect(() => invariant(numberValue)).not.toThrow()

    const falseValue = false
    expect(() => invariant(falseValue)).not.toThrow()
  })

  it('should throw for null values', () => {
    expect(() => invariant(null)).toThrow(
      'Invariant failed: value is null or undefined',
    )
    expect(() => invariant(null, 'Custom message')).toThrow('Custom message')
  })

  it('should throw for undefined values', () => {
    expect(() => invariant(undefined)).toThrow(
      'Invariant failed: value is null or undefined',
    )
    expect(() => invariant(undefined, 'Custom message')).toThrow(
      'Custom message',
    )
  })

  it('should work with type narrowing', () => {
    // TypeScript test: the following code should compile without errors
    const maybeString: string | undefined = 'test'
    invariant(maybeString)
    // After invariant, TypeScript knows maybeString is a string
    expect(maybeString.length).toBeGreaterThan(0)
  })
})
