const property = require('../controllers/property');

test('1. Occurence should be 2 for substring.',() => {
    expect(property.occurrences('near daiict road, daiict','daii')).toBe(2);
});
test('2. Consider space as a charactor in string.',() => {
    expect(property.occurrences('Facilisis tortor us trat malestuada stagittis.','st')).toBe(2);
});
test('3. Consider overlapping of substring.',() => {
    expect(property.occurrences('wowowow','wow',true)).toBe(3);
});
test('4. Avoid overlapping of substring.',() => {
    expect(property.occurrences('wowowow','wow',false)).toBe(2);
});
test('5. Reject occurence of empty substring.',() => {
    expect(property.occurrences('Empty Substring','')).toBe(0);
});
test('6. Same string and substring.',() =>{
    expect(property.occurrences('software engineering','software engineering')).toBe(1);
});
test('7. Reverse substring.',() => {
    expect(property.occurrences('mirror','rorrim')).toBe(0);
});
test('8. When string is NULL.',() => {
    expect(property.occurrences('','test')).toBe(0);
});
test('9. When string is palidrome.',() => {
    expect(property.occurrences('naman','nam')).toBe(1);
});
test('10. String contain special character.',() => {
    expect(property.occurrences('doller$','rs')).toBe(0);
});
test('11. Consider extra space at the end of substring.', () =>{
    expect(property.occurrences('Near reliance chowakadi','reli ')).toBe(0);
});
test('12. Check for substring with space.' ,() => {
    expect(property.occurrences('Facilisis tortor us trat malestuada stagittis.','s t')).toBe(2);
})
test('13. Ignore/Consider extra space at begining of substring.', ()=>{
    expect(property.occurrences('Near reliance chowkadi',' eli')).toBe(0);
});