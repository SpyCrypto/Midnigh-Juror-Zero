// This file is part of Compact.
// Copyright (C) 2025 Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// 	http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/**
 * The maximum value representable in Compact's `Field` type
 *
 * One less than the prime modulus of the proof system's scalar field
 */
export const MAX_FIELD = 52435875175126190479447740508185965837690552500527637822603658699938581184512n;
/**
 * A valid placeholder contract address
 *
 * @deprecated Cannot handle {@link NetworkId}s, use
 * {@link dummyContractAddress} instead.
 */
export const DUMMY_ADDRESS = '0000000000000000000000000000000000000000000000000000000000000000';
//# sourceMappingURL=constants.js.map