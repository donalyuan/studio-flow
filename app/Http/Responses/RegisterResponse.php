<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{
    public function toResponse($request)
    {
        return $request->wantsJson()
            ? response()->json(null, 201)
            : redirect()->intended('/')->with('status', 'Account created. You are logged in.');
    }
}
