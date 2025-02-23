class QuoteProcessing {
  constructor(quotes) {
    this.quotes = quotes
  }
  stackQuotesVertically(){
    let verticalQuotes = []
    this.quotes.forEach(quote => {
      verticalQuotes.push({
        Author: quote.Author,
        Quote: quote.Quote.replaceAll(' ', '\n')
      })
    })
    return verticalQuotes
  }   
}

export { QuoteProcessing }