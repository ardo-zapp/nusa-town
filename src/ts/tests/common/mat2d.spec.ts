import '../lib';
import { expect } from 'chai';
import { createMat2D, identityMat2D, copyMat2D, setMat2D } from '../../common/mat2d';

describe('mat2d', () => {
	describe('createMat2D()', () => {
		it('creates an identity matrix', () => {
			expect(createMat2D()).eql(new Float32Array([1, 0, 0, 1, 0, 0]));
		});
	});

	describe('identityMat2D()', () => {
		it('resets matrix to identity', () => {
			const mat = new Float32Array([1, 2, 3, 4, 5, 6]);
			identityMat2D(mat);
			expect(mat).eql(new Float32Array([1, 0, 0, 1, 0, 0]));
		});

		it('returns the matrix', () => {
			const mat = createMat2D();
			expect(identityMat2D(mat)).to.equal(mat);
		});
	});

	describe('copyMat2D()', () => {
		it('copies values from one matrix to another', () => {
			const a = new Float32Array([1, 2, 3, 4, 5, 6]);
			const out = createMat2D();
			copyMat2D(out, a);
			expect(out).eql(a);
		});

		it('returns the output matrix', () => {
			const a = new Float32Array([1, 2, 3, 4, 5, 6]);
			const out = createMat2D();
			expect(copyMat2D(out, a)).to.equal(out);
		});
	});

	describe('setMat2D()', () => {
		it('sets all elements of the matrix', () => {
			const out = new Float32Array(6);
			setMat2D(out, 1, 2, 3, 4, 5, 6);
			expect(out).eql(new Float32Array([1, 2, 3, 4, 5, 6]));
		});

		it('returns the output matrix', () => {
			const out = new Float32Array(6);
			expect(setMat2D(out, 1, 2, 3, 4, 5, 6)).to.equal(out);
		});
	});
});
